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
  Cancel: IntentData;
  Delivery: IntentData;
  EntityTests: IntentData;
  Greeting: IntentData;
  Help: IntentData;
  None: IntentData;
  Roles: IntentData;
  search: IntentData;
  SpecifyName: IntentData;
  Travel: IntentData;
  Weather_GetForecast: IntentData;
}

export interface GeneratedInstance {}

export interface GeneratedEntities {
  // Simple entities

  // Built-in entities

  // Lists

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
