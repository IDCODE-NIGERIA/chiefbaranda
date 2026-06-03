import { NextRequest } from 'next/server';

import { successResponse, errorResponse, validationError } from '@/lib/api-utils';

// VINs are 17 characters and never contain I, O or Q (to avoid confusion
// with 1 and 0). Anything else is rejected before we hit the upstream API.
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

const NHTSA_ENDPOINT = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues';

// Raw shape of the single result object NHTSA returns for DecodeVinValues.
interface NhtsaResult {
  Make?: string;
  Model?: string;
  ModelYear?: string;
  Trim?: string;
  BodyClass?: string;
  VehicleType?: string;
  FuelTypePrimary?: string;
  EngineCylinders?: string;
  DisplacementL?: string;
  Doors?: string;
  DriveType?: string;
  TransmissionStyle?: string;
  PlantCountry?: string;
  Manufacturer?: string;
  Series?: string;
  ErrorCode?: string;
  ErrorText?: string;
}

function clean(value?: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'not applicable') return null;
  return trimmed;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawVin = typeof body?.vin === 'string' ? body.vin.trim().toUpperCase() : '';

    if (!rawVin) {
      return validationError({ vin: 'VIN is required' });
    }
    if (!VIN_REGEX.test(rawVin)) {
      return validationError({
        vin: 'Enter a valid 17-character VIN (letters and numbers, no I, O or Q)',
      });
    }

    const url = `${NHTSA_ENDPOINT}/${encodeURIComponent(rawVin)}?format=json`;
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      // Decoded VINs never change, so let Next cache the upstream response.
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!upstream.ok) {
      return errorResponse('VIN lookup service is unavailable', 'UPSTREAM_ERROR', 502);
    }

    const json = (await upstream.json()) as { Results?: NhtsaResult[] };
    const result = json.Results?.[0];

    if (!result) {
      return errorResponse('No data returned for this VIN', 'NOT_FOUND', 404);
    }

    // ErrorCode "0" means a clean decode. Other codes can still carry useful
    // partial data, so we surface a note rather than failing outright — unless
    // we got nothing usable back at all.
    const errorCode = result.ErrorCode?.split(',')[0]?.trim() ?? '';
    const make = clean(result.Make);
    const model = clean(result.Model);
    const year = clean(result.ModelYear);

    if (!make && !model && !year) {
      return errorResponse(
        clean(result.ErrorText) || 'Could not decode this VIN',
        'DECODE_FAILED',
        422
      );
    }

    return successResponse(
      {
        vin: rawVin,
        make,
        model,
        year,
        trim: clean(result.Trim) || clean(result.Series),
        bodyClass: clean(result.BodyClass),
        vehicleType: clean(result.VehicleType),
        fuelType: clean(result.FuelTypePrimary),
        engineCylinders: clean(result.EngineCylinders),
        displacementL: clean(result.DisplacementL),
        doors: clean(result.Doors),
        driveType: clean(result.DriveType),
        transmission: clean(result.TransmissionStyle),
        manufacturer: clean(result.Manufacturer),
        plantCountry: clean(result.PlantCountry),
        partial: errorCode !== '0',
        note: errorCode !== '0' ? clean(result.ErrorText) : null,
      },
      'VIN decoded successfully'
    );
  } catch (error) {
    console.error('VIN decode error:', error);
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
