/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable:no-console
// tslint:disable:no-object-literal-type-assertion

import { expect, test } from '@oclif/test';
import * as fs from 'fs-extra'
import 'mocha'
import * as os from 'os'
import * as ppath from 'path'
import DialogForm from '../../../src/commands/dialog/form'
import * as ft from '../../../src/library/formTracker'
import { fail } from 'assert';

describe('dialog:form', async () => {
    let output = ppath.join(os.tmpdir(), "test.out")
    let schemaPath = "test/commands/dialog/forms/sandwich-schema.json"
    let badSchema = "test/commands/dialog/forms/bad-schema.json"
    let notObject = "test/commands/dialog/forms/not-object-schema.json"
    before(async () => {
        await fs.remove(output)
        await fs.mkdirp(output)
    })

    it("Not object type", async () => {
        try {
            let schema = await ft.FormSchema.readSchema(notObject)
            fail("Did not detect bad schema");
        }
        catch (e) {
            expect(e).to.contain("must be of type object")
        }
    })

    it("Illegal schema", async () => {
        try {
            let schema = await ft.FormSchema.readSchema(badSchema)
            fail("Did not detect bad schema");
        }
        catch (e) {
            expect(e.message).to.contain("Error parsing")
        }
    })

    it("Generation", async () => {
        try {
            let schema = await ft.FormSchema.readSchema(schemaPath)
            await schema.generate(output)
        }
        catch (e) {
            fail(e.message)
        }
    })

    /*
    test
        .stdout()
        .stderr()
        .command(["dialog:form", `${badSchema}`])
        .it("Detect bad schema", ctx => {
            expect(ctx.stderr)
                .to.contain("must be of type object")
        })

    test
        .stdout()
        .stderr()
        .command(["dialog:form", `${schemaPath}`, "-o", `${output}`])
        .it("Detect success", ctx => {
            expect(ctx.stdout)
                .to.contain("Generated")
        })
        */
})