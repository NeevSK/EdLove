import type { DSDivision, GNDivision } from '@intuitui-labs/lk-edu-geo';
import * as Location from 'expo-location';
import { useCallback, useMemo, useState } from 'react';
import { Drilldown } from '@repo/graphics/data/AdministrativeHierarchy';
import { inferFromPostalCode } from '@repo/graphics/data/PostalCodes';

export interface LocationState {
  provinceId: string;
  districtId: string;
  dsDivisionId: string;
  gnDivisionId: string;
  city: string;
  postalCode: string;
  error?: string;
}

export function useSriLankaLocation(initialState?: Partial<LocationState>) {
  const [state, setState] = useState<LocationState>({
    provinceId: '',
    districtId: '',
    dsDivisionId: '',
    gnDivisionId: '',
    city: '',
    postalCode: '',
    ...initialState,
  });

  const updateLocation = useCallback((updates: Partial<LocationState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates };

      // If postal code changed, try to infer others
      if (updates.postalCode && updates.postalCode !== prev.postalCode) {
        const inferred = inferFromPostalCode(updates.postalCode);
        if (inferred) {
          newState.city = inferred.city;
          newState.districtId = inferred.districtId;
          // In this unified model, the caller is responsible for provincial alignment
          // or we can add a helper to Drilldown to find province by district.
        }
      }

      return newState;
    });
  }, []);

  const resetDownstream = useCallback(
    (level: 'province' | 'district' | 'ds') => {
      if (level === 'province') {
        updateLocation({ districtId: '', dsDivisionId: '', gnDivisionId: '' });
      } else if (level === 'district') {
        updateLocation({ dsDivisionId: '', gnDivisionId: '' });
      } else if (level === 'ds') {
        updateLocation({ gnDivisionId: '' });
      }
    },
    [updateLocation],
  );

  const getCurrentPosition = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        updateLocation({ error: 'Permission denied' });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        // Heuristic: Match city/district from reverse geocode
        const _provinces = Drilldown.getProvinces();
        const districts = Drilldown.getDistricts('');
        const district = districts.find(
          (d) =>
            d.en.toLowerCase() === address.district?.toLowerCase() ||
            d.en.toLowerCase() === address.city?.toLowerCase(),
        );

        updateLocation({
          city: address.city || '',
          districtId: district?.id || '',
          postalCode: address.postalCode || '',
        });
      }
    } catch {
      updateLocation({ error: 'Failed to get location' });
    }
  };

  const options = useMemo(
    () => ({
      provinces: Drilldown.getProvinces(),
      districts: Drilldown.getDistricts(state.provinceId),
      dsDivisions: Drilldown.getDSDivisions(state.districtId) as DSDivision[],
      gnDivisions: Drilldown.getGNDivisions(state.dsDivisionId) as GNDivision[],
    }),
    [state.provinceId, state.districtId, state.dsDivisionId],
  );

  return {
    ...state,
    updateLocation,
    resetDownstream,
    getCurrentPosition,
    options,
  };
}
