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
  City?: InstanceData[];
  From?: InstanceData[];
  Name?: InstanceData[];
  State?: InstanceData[];
  To?: InstanceData[];
  Weather_Location?: InstanceData[];
  destination?: InstanceData[];
  likee?: InstanceData[];
  liker?: InstanceData[];
  source?: InstanceData[];
}

export interface GeneratedEntities {
  // Simple entities
  City?: string[];
  To?: string[];
  From?: string[];
  Name?: string[];
  likee?: string[];
  liker?: string[];
  State?: string[];
  Weather_Location?: string[];
  destination?: string[];
  source?: string[];

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
