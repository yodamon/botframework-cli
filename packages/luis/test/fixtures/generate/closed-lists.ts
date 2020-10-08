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

export interface GeneratedIntents {}

export interface GeneratedInstance {
  Airline?: InstanceData[];
  Buyer?: InstanceData[];
  Seller?: InstanceData[];
}

export interface GeneratedEntities {
  // Simple entities

  // Built-in entities

  // Lists
  Airline?: string[][];
  Buyer?: string[][];
  Seller?: string[][];

  // Regex entities

  // Pattern.any

  // Composites
  $instance: GeneratedInstance;
}

export interface ContosoApp {
  text: string;
  alteredText?: string;
  intents: GeneratedIntents;
  entities: GeneratedEntities;
  [propName: string]: any;
}
