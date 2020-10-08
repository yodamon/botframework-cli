/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
  DateTimeSpec,
  GeographyV2,
  InstanceData,
  IntentData,
  NumberWithUnits,
  OrdinalV2,
} from 'botbuilder-ai';

export interface GeneratedIntents {
  BookFlight: IntentData;
  Cancel: IntentData;
  GetWeather: IntentData;
  None: IntentData;
}

export interface GeneratedInstanceFrom {
  Airport?: InstanceData[];
}
export interface From {
  Airport?: string[][];
  $instance?: GeneratedInstanceFrom;
}

export interface GeneratedInstanceTo {
  Airport?: InstanceData[];
}
export interface To {
  Airport?: string[][];
  $instance?: GeneratedInstanceTo;
}

export interface GeneratedInstance {
  Airport?: InstanceData[];
  From?: InstanceData[];
  To?: InstanceData[];
  datetime?: InstanceData[];
}

export interface GeneratedEntities {
  // Simple entities

  // Built-in entities
  datetime?: DateTimeSpec[];

  // Lists
  Airport?: string[][];

  // Regex entities

  // Pattern.any

  // Composites
  From?: From[];
  To?: To[];
  $instance: GeneratedInstance;
}

export interface FlightBooking {
  text: string;
  alteredText?: string;
  intents: GeneratedIntents;
  entities: GeneratedEntities;
  [propName: string]: any;
}
