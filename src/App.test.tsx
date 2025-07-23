import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders initial state correctly', () => {
    render(<App />);
    expect(screen.getByText(/Total Monitoring Time/i)).toBeInTheDocument();
    expect(screen.getByText('0:00:00')).toBeInTheDocument();
    expect(screen.getByText('Contraction Time')).toBeInTheDocument();
    expect(screen.getByText('Contraction Time').nextElementSibling).toHaveTextContent('00:00.000');
    expect(screen.getByText('Frequency Time')).toBeInTheDocument();
    expect(screen.getByText('Frequency Time').nextElementSibling).toHaveTextContent('00:00.000');
  });

  test('starts and stops a contraction', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Start Contraction'));
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    fireEvent.click(screen.getByText('Stop Contraction'));
    
    expect(screen.getByText('Contraction Time').nextElementSibling).toHaveTextContent(/00:05/);
  });

  test('records frequency time', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Start Contraction'));
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    fireEvent.click(screen.getByText('Stop Contraction'));

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    fireEvent.click(screen.getByText('Start Contraction'));
    expect(screen.getByText('Frequency Time').nextElementSibling).toHaveTextContent(/00:10/);
  });

  test('resets all timers and data', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Start Contraction'));
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    fireEvent.click(screen.getByText('Stop Contraction'));

    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByText('0:00:00')).toBeInTheDocument();
    expect(screen.getAllByText('00:00.000')[0]).toBeInTheDocument();
    expect(screen.queryByText(/00:05/)).not.toBeInTheDocument();
  });
});
