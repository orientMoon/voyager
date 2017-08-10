import { DateTime } from 'vega-lite/build/src/datetime';
import { OneOfFilter, RangeFilter } from 'vega-lite/build/src/filter';
import { TimeUnit } from 'vega-lite/build/src/timeunit';
import { ShelfFieldDef } from './encoding';
export declare function getFilter(fieldDef: ShelfFieldDef, domain: any[]): RangeFilter | OneOfFilter;
export declare function getAllTimeUnits(): ("day" | "month" | "year" | "date" | "hours" | "minutes" | "seconds" | "milliseconds" | "yearmonthdate" | "quarter")[];
export declare function getDefaultRange(domain: number[], timeUnit: TimeUnit): number[] | DateTime[];
export declare function getDefaultList(timeUnit: TimeUnit): string[];
export declare function convertToDateTimeObject(timeStamp: number): DateTime;
export declare function convertToTimestamp(dateTime: DateTime): number;
