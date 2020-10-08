/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
class LUResource {
  /**
   * @param {any[]} sections
   * @param {string} content
   * @param {any[]} errors
   */
  constructor(sections, content, errors) {
    this.Sections = sections || [];
    this.Content = content;
    this.Errors = errors || [];
  }
}

module.exports = LUResource;
