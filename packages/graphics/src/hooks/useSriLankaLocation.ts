import { useState, useCallback, useMemo } from 'react';
import * as Location from 'expo-location';
import { Drilldown, DISTRICT_TO_DS_DIVISIONS } from '../data/AdministrativeHierarchy';
import { inferFromPostalCode } from '../data/PostalCodes';
import { SRI_LANKAN_DISTRICTS } from '@repo/core';


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
        setState(prev => {
            const newState = { ...prev, ...updates };
            
            // If postal code changed, try to infer others
            if (updates.postalCode && updates.postalCode !== prev.postalCode) {
                const inferred = inferFromPostalCode(updates.postalCode);
                if (inferred) {
                    newState.city = inferred.city;
                    newState.districtId = inferred.districtId;
                    const district = SRI_LANKAN_DISTRICTS.find(d => d.id === inferred.districtId);
                    if (district) newState.provinceId = district.provinceId;
                }
            }
            
            return newState;
        });
    }, []);


    const resetDownstream = useCallback((level: 'province' | 'district' | 'ds') => {
        if (level === 'province') {
            updateLocation({ districtId: '', dsDivisionId: '', gnDivisionId: '' });
        } else if (level === 'district') {
            updateLocation({ dsDivisionId: '', gnDivisionId: '' });
        } else if (level === 'ds') {
            updateLocation({ gnDivisionId: '' });
        }
    }, [updateLocation]);

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
                const district = SRI_LANKAN_DISTRICTS.find(
                    d => d.en.toLowerCase() === address.district?.toLowerCase() ||
                         d.en.toLowerCase() === address.city?.toLowerCase()
                );

                updateLocation({
                    city: address.city || '',
                    districtId: district?.id || '',
                    provinceId: district?.provinceId || '',
                    postalCode: address.postalCode || '',
                });
            }
        } catch (err) {
            updateLocation({ error: 'Failed to get location' });
        }
    };

    const options = useMemo(() => ({
        provinces: Drilldown.getProvinces(),
        districts: Drilldown.getDistricts(state.provinceId),
        dsDivisions: Drilldown.getDSDivisions(state.districtId),
        gnDivisions: Drilldown.getGNDivisions(state.dsDivisionId),
    }), [state.provinceId, state.districtId, state.dsDivisionId]);

    return {
        ...state,
        updateLocation,
        resetDownstream,
        getCurrentPosition,
        options,
    };
}
