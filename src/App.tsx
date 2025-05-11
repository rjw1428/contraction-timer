import { useEffect, useMemo, useState } from 'react';
import { Subscription, timer, map, Subject, switchMap, takeUntil, exhaustMap, take, finalize, scan, startWith, merge, shareReplay, filter } from 'rxjs'
import './App.css'

// Constants
const SAMPLE_INTERVAL = 10;
const COLUMNS = {
  frequency: 'freq',
  contraction: 'contract'
}

// Types
type Item = {
  id: number;
  column: string;
  value: number;
}
type ListItem = Item & { value: string };

// Helper functions
const pad = (n: number, p: number = 2) => n.toString().padStart(p, '0');
const average = (arr: number[]) => Math.floor(arr.reduce((sum, cur) => cur + sum, 0) / arr.length);
const formatTime = (t: number, withMilliseconds = true, showHour = false) => {
  const h = Math.floor(t / (60 * 60 * 1000));
  const m = Math.floor(t / (60 * 1000) - (h * 60));
  const s = Math.floor(t / 1000 - (m * 60) - (h * 60 * 60));
  const ms = t % 1000;
  const base = (h  > 0 || showHour) ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return withMilliseconds ? `${base}.${pad(ms, 3)}` : base;
}

// RxJS State
const start$ = new Subject<number>();
const stop$ = new Subject<void>();
const reset$ = new Subject<void>();
const remove$ = new Subject<Item>()

const overallTimer$ = start$.pipe(
  exhaustMap((start) => timer(0, SAMPLE_INTERVAL).pipe(
    map(() => Date.now() - start),
    takeUntil(reset$),
    finalize(() => console.log('Overall Timer completed')),
  )),
);

const intervalTime$ = start$.pipe(
  exhaustMap((start) => timer(0, SAMPLE_INTERVAL).pipe(
    map(() => Date.now() - start),
    takeUntil(merge(stop$, reset$)),
    finalize(() => console.log('Interval Timer completed')),
  )),
)

const frequencyTimer$ = stop$.pipe(
  exhaustMap(() => {
    const lastEnd = Date.now();
    return timer(0, SAMPLE_INTERVAL).pipe(
      map(() => Date.now() - lastEnd),
      takeUntil(merge(start$, reset$)),
      finalize(() => console.log('Frequency Timer completed')),
    )
  }),
) 

const removeFrequencyList$ = reset$.pipe(
  startWith(0),
  switchMap(() => remove$.pipe(
    filter((item) => item.column === COLUMNS.frequency),
    scan((acc, curr) => acc.concat(curr.id), [] as number[]),
    startWith([] as number[]),
  )),
  shareReplay(1),
)

const removeIntervalList$ = reset$.pipe(
  startWith(0),
  switchMap(() => remove$.pipe(
    filter((item) => item.column === COLUMNS.contraction),
    scan((acc, curr) => acc.concat(curr.id), [] as number[]),
    startWith([] as number[]),
  )),
  shareReplay(1),
)

const frequency$ = reset$.pipe(
  startWith(0),
  switchMap(() => stop$.pipe(
    exhaustMap(() => {
      const lastEnd = Date.now();
      return start$.pipe(
        take(1),
        map((latestStart) => latestStart - lastEnd),  
      )
    }),
    scan((acc, curr, i) => acc.concat({id: i, value: curr, column: COLUMNS.frequency}), [] as Item[]),
    switchMap((list) => removeFrequencyList$.pipe(
      map(removes => list.filter(item => !removes.includes(item.id)))
    )),
    finalize(() => console.log('Frequency list completed')),
    startWith([]),
  )),
)

const intervals$ = reset$.pipe(
    startWith(0),
    switchMap(() => start$.pipe(
      exhaustMap((start) => stop$.pipe(
        map(() => Date.now() - start),
        take(1),
        finalize(() => console.log('Interval completed')),
      )),
      scan((acc, curr, i) => acc.concat({id: i, value: curr, column: COLUMNS.contraction}), [] as Item[]),
      switchMap((list) => removeIntervalList$.pipe(
        map(removes => list.filter(item => !removes.includes(item.id)))
      )),
      finalize(() => console.log('Interval list completed')),
      startWith([]),
    ))
)

let subs: Subscription[]= [];

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [getOverallTimer, setOverallTimer] = useState(0);
  const [getIntervalTimer, setIntervalTimer] = useState(0);
  const [getFrequencyTimer, setFrequencyTimer] = useState(0);
  const [getIntervals, setIntervals] = useState<Item[]>([]);
  const [getFrequency, setFrequency] = useState<Item[]>([]);

  useEffect(() => {
    subs.push(overallTimer$.subscribe((t) => setOverallTimer(t)))
    subs.push(intervals$.subscribe((intervals) => setIntervals(intervals)))
    subs.push(intervalTime$.subscribe((t) => setIntervalTimer(t)))
    subs.push(frequency$.subscribe((frequency) => setFrequency(frequency)))
    subs.push(frequencyTimer$.subscribe((t) => setFrequencyTimer(t)))

    return () => {
      subs.forEach((s) => s.unsubscribe());
      onReset();
    }
  }, [])

  const startTimer = () => {    
    setIsRunning(!isRunning)
    start$.next(Date.now())
  }

  const stopTimer = () => {
    setIsRunning(!isRunning)
    stop$.next()
  }

  const onReset = () => {
    setOverallTimer(0)
    setIntervalTimer(0)
    setFrequencyTimer(0)
    setFrequency([])
    setIntervals([])
    setIsRunning(false)
    reset$.next()
  }

  const {overallTime, intervalTime, frequencyTime, intervals, frequency} = useMemo(() => ({
    overallTime: formatTime(getOverallTimer, false, true),
    intervalTime: formatTime(getIntervalTimer),
    frequencyTime: formatTime(getFrequencyTimer),
    intervals: getIntervals.map((i) => ({...i, value: formatTime(i.value, true)} as ListItem)).reverse(),
    frequency: getFrequency.map((i) => ({...i, value: formatTime(i.value, true)} as ListItem)).reverse(),
  }), [getOverallTimer]);

  const createRowItem = (item: ListItem, index: number, arr: ListItem[]) => {
    return <li style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around'}} key={item.id}>
      <div style={{flexBasis: '100%'}}><strong>{arr.length - index})</strong> {item.value}</div>
      <button style={{backgroundColor: 'unset'}} onClick={() => remove$.next(item)}>
        <svg className="remove-button" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.70711 8.29289C9.31658 7.90237 8.68342 7.90237 8.29289 8.29289C7.90237 8.68342 7.90237 9.31658 8.29289 9.70711L10.5858 12L8.29289 14.2929C7.90237 14.6834 7.90237 15.3166 8.29289 15.7071C8.68342 16.0976 9.31658 16.0976 9.70711 15.7071L12 13.4142L14.2929 15.7071C14.6834 16.0976 15.3166 16.0976 15.7071 15.7071C16.0976 15.3166 16.0976 14.6834 15.7071 14.2929L13.4142 12L15.7071 9.70711C16.0976 9.31658 16.0976 8.68342 15.7071 8.29289C15.3166 7.90237 14.6834 7.90237 14.2929 8.29289L12 10.5858L9.70711 8.29289Z"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12Z" />
        </svg>
      </button>
    </li>
  }

  const button = isRunning
  ? <button style={{marginTop: '20px', padding: '1.2em 2.4em', background: 'lightcoral'}} onClick={stopTimer}>Stop Contraction</button>
  : <button style={{marginTop: '20px', padding: '1.2em 2.4em', background: 'lightgreen'}} onClick={startTimer}>Start Contraction</button>

  
  return (
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '80vh', overflow: 'hidden'}}>
      <p>Total Monitoring Time</p>
      <h1>{overallTime}</h1>

      <div className="row" style={{ display: 'flex', flexDirection: 'row', height: '50vh'}}>
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <p>Contraction Time</p>
          <h2>{intervalTime}</h2>

          <h2 className='header'>Average Contraction</h2>
          {getIntervals.length > 0 && <h2>{formatTime(average(getIntervals.map(i => i.value)), true)}</h2>}

          <p>Contractions</p>
          <ul style={{ listStyleType: 'none', padding: 0, overflow: 'auto' }}>
            {intervals.map(createRowItem)}
          </ul>
        </div>

        <div  style={{ display: 'flex', flexDirection: 'column'}}>
          <p>Frequency Time</p>
          <h2>{frequencyTime}</h2>

          <h2 className="header">Average Frequency</h2>
          {getFrequency.length > 0 && <h2>{formatTime(average(getFrequency.map(i => i.value)), true)}</h2>}

          <p>Frequency</p> 
          <ul style={{ listStyleType: 'none', padding: 0, overflow: 'auto'  }}>
            {frequency.map(createRowItem)}
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {button}
        <button onClick={onReset}>Reset</button>
      </div>
    </div>
  )
}

export default App
