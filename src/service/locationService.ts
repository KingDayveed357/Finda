// services/locationService.ts
import { httpClient } from '@/utils/http-client';

export interface Country {
  id: number;
  name: string;
  code: string;
  phone_code: string;
  currency_code: string;
  currency_symbol: string;
  flag_emoji: string;
  continent: string;
  display_name: string;
}

export interface State {
  id: number;
  name: string;
  code: string;
  type: string;
  country: number;
  country_name: string;
  display_name: string;
}

export interface City {
  id: number;
  name: string;
  state: number;
  country: number;
  state_name: string;
  country_name: string;
  latitude: number;
  longitude: number;
  population: number;
  is_capital: boolean;
  is_major_city: boolean;
  full_address: string;
}

export interface LocationHierarchy {
  country: Country;
  state: State;
  city: City;
}

export interface CountryFilters {
  search?: string;
  ordering?: 'name' | 'sort_order' | '-name' | '-sort_order';
}

export interface StateFilters {
  country?: number;
  search?: string;
}

export interface CityFilters {
  state?: number;
  country?: number;
  search?: string;
}

class LocationService {
  private readonly baseUrl = '/api/main';

  /**
   * Get all countries
   */
  async getCountries(filters?: CountryFilters): Promise<Country[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const url = params.toString() ? `${this.baseUrl}/countries/?${params.toString()}` : `${this.baseUrl}/countries/`;
      const response = await httpClient.get<{ count: number; results: Country[] }>(url);
      
      return response.results;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw new Error('Failed to fetch countries');
    }
  }

  /**
   * Get popular countries
   */
  async getPopularCountries(): Promise<Country[]> {
    try {
      const response = await httpClient.get<{ count: number; results: Country[] }>(`${this.baseUrl}/countries/popular/`);
      return response.results;
    } catch (error) {
      console.error('Error fetching popular countries:', error);
      throw new Error('Failed to fetch popular countries');
    }
  }

  /**
   * Get states by country
   */
  async getStates(filters?: StateFilters): Promise<State[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const url = params.toString() ? `${this.baseUrl}/states/?${params.toString()}` : `${this.baseUrl}/states/`;
      const response = await httpClient.get<{ count: number; results: State[] }>(url);
      
      return response.results;
    } catch (error) {
      console.error('Error fetching states:', error);
      throw new Error('Failed to fetch states');
    }
  }

  /**
   * Get states by country ID
   */
  async getStatesByCountry(countryId: number): Promise<State[]> {
    return this.getStates({ country: countryId });
  }

  /**
   * Get cities
   */
  async getCities(filters?: CityFilters): Promise<City[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const url = params.toString() ? `${this.baseUrl}/cities/?${params.toString()}` : `${this.baseUrl}/cities/`;
      const response = await httpClient.get<{ count: number; results: City[] }>(url);
      
      return response.results;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw new Error('Failed to fetch cities');
    }
  }

  /**
   * Get cities by state ID
   */
  async getCitiesByState(stateId: number): Promise<City[]> {
    return this.getCities({ state: stateId });
  }

  /**
   * Get cities by country ID
   */
  async getCitiesByCountry(countryId: number): Promise<City[]> {
    return this.getCities({ country: countryId });
  }

  /**
   * Get location hierarchy
   */
  async getLocationHierarchy(params: { city_id?: number; state_id?: number; country_id?: number }): Promise<LocationHierarchy> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const url = `${this.baseUrl}/location/hierarchy/?${queryParams.toString()}`;
      const response = await httpClient.get<LocationHierarchy>(url);
      
      return response;
    } catch (error) {
      console.error('Error fetching location hierarchy:', error);
      throw new Error('Failed to fetch location hierarchy');
    }
  }

  /**
   * Search countries
   */
  async searchCountries(query: string): Promise<Country[]> {
    return this.getCountries({ search: query });
  }

  /**
   * Search states
   */
  async searchStates(query: string, countryId?: number): Promise<State[]> {
    return this.getStates({ search: query, country: countryId });
  }

  /**
   * Search cities
   */
  async searchCities(query: string, stateId?: number, countryId?: number): Promise<City[]> {
    return this.getCities({ search: query, state: stateId, country: countryId });
  }
}

export const locationService = new LocationService();