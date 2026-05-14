import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocationAutocomplete } from '../LocationAutocomplete';
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('LocationAutocomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default placeholder', () => {
    render(<LocationAutocomplete onLocationSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument();
  });

  it('calls onLocationSelect with null when input is cleared', () => {
    const handleSelect = vi.fn();
    render(<LocationAutocomplete value="New York" onLocationSelect={handleSelect} />);
    
    const input = screen.getByDisplayValue('New York');
    fireEvent.change(input, { target: { value: '' } });
    
    expect(handleSelect).toHaveBeenCalledWith(null);
  });

  it('fetches and displays results when typing', async () => {
    const mockResults = [
      {
        place_id: '123',
        display_name: 'London, Greater London, England, United Kingdom',
        lat: '51.5072',
        lon: '-0.1276'
      }
    ];

    global.fetch.mockResolvedValueOnce({
      json: async () => mockResults
    });

    render(<LocationAutocomplete onLocationSelect={vi.fn()} />);
    
    const input = screen.getByPlaceholderText('Search for a city...');
    fireEvent.change(input, { target: { value: 'Lon' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Check if result is rendered
    expect(await screen.findByText('London')).toBeInTheDocument();
    expect(screen.getByText('London, Greater London, England, United Kingdom')).toBeInTheDocument();
  });

  it('calls onLocationSelect when a result is clicked', async () => {
    const mockResults = [
      {
        place_id: '123',
        display_name: 'Paris, Ile-de-France, France',
        lat: '48.8566',
        lon: '2.3522'
      }
    ];

    global.fetch.mockResolvedValueOnce({
      json: async () => mockResults
    });

    const handleSelect = vi.fn();
    render(<LocationAutocomplete onLocationSelect={handleSelect} />);
    
    const input = screen.getByPlaceholderText('Search for a city...');
    fireEvent.change(input, { target: { value: 'Par' } });

    const resultButton = await screen.findByText('Paris');
    fireEvent.click(resultButton);

    expect(handleSelect).toHaveBeenCalledWith({
      name: 'Paris, France',
      city: 'Paris',
      country: 'France',
      lat: 48.8566,
      lon: 2.3522
    });
  });
});
