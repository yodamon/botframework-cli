/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const {ServiceBase} = require('./serviceBase')
const NEWLINE = require('os').EOL

const absoluteUrlPattern = /^https?:\/\//i

export class QnaBuildCore {
  private readonly service: any

  constructor(subscriptionkey: string, endpoint: string) {
    // check endpoint is absolute or not
    if (!absoluteUrlPattern.test(endpoint)) {
      throw new Error(`Only absolute URLs are supported. "${endpoint}" is not an absolute qnamaker endpoint URL.`)
    }

    this.service = new ServiceBase(endpoint, subscriptionkey)
  }

  public async getKBList() {
    const response = await this.service.createRequest('/knowledgebases', 'GET')
    const text = await response.text()
    const kbList = JSON.parse(text)
    if (kbList.error) {
      throw new Error(kbList.error.message)
    }

    return kbList
  }

  public async getKB(kbId: string) {
    const response = await this.service.createRequest(`/knowledgebases/${kbId}`, 'GET')
    const text = await response.text()
    const kb = JSON.parse(text)
    if (kb.error) {
      throw new Error(kb.error.message)
    }

    return kb
  }

  public async importKB(kbPayload: any) {
    const response = await this.service.createRequest('/knowledgebases/createasync', 'POST', kbPayload)
    const text = await response.text()
    const status = JSON.parse(text)
    if (status.error) {
      throw new Error(status.error.message)
    }

    return status
  }

  public async getOperationStatus(operationId: string) {
    const response = await this.service.createRequest(`/operations/${operationId}`, 'GET')
    const text = await response.text()
    const status = JSON.parse(text)
    if (status.error) {
      throw new Error(status.error.message)
    }

    return status
  }

  public async exportKB(kbId: string, environment: string) {
    const response = await this.service.createRequest(`/knowledgebases/${kbId}/${environment}/qna`, 'GET')
    const text = await response.text()
    const kb = JSON.parse(text)
    if (kb.error) {
      throw new Error(kb.error.message)
    }

    return kb
  }

  public async updateKB(kbId: string, replaceKb: any) {
    const response = await this.service.createRequest(`/knowledgebases/${kbId}`, 'PATCH', replaceKb)
    const text = await response.text()
    const status = JSON.parse(text)
    if (status.error) {
      throw new Error(status.error.message)
    }

    return status
  }

  public async replaceKB(kbId: string, replaceKb: any) {
    const response = await this.service.createRequest(`/knowledgebases/${kbId}`, 'PUT', replaceKb)
    const text = await response.text()
    if (text) {
      throw new Error(JSON.parse(text).error.message)
    }
  }

  public async publishKB(kbId: string) {
    const response = await this.service.createRequest(`/knowledgebases/${kbId}`, 'POST')
    const text = await response.text()
    if (text) {
      throw new Error(JSON.parse(text).error.message)
    }
  }

  public async replaceAlt(altJson: any) {
    const response = await this.service.createRequest('/alterations', 'PUT', altJson)
    const text = await response.text()
    if (text) {
      throw new Error(JSON.parse(text).error.message)
    }
  }

  public async getEndpointKeys() {
    const response = await this.service.createRequest('/endpointkeys', 'GET')
    const text = await response.text()
    const endpointKeys = JSON.parse(text)
    if (endpointKeys.error) {
      throw new Error(endpointKeys.error.message)
    }

    return endpointKeys
  }

  public async deleteKB(kbId: string) {
    const response = await this.service.createRequest(`/knowledgebases/${kbId}`, 'DELETE')
    const text = await response.text()
    if (text) {
      throw new Error(JSON.parse(text).error.message)
    }
  }

  public isKBEqual(kbA: any, kbB: any): boolean {
    const qnaListA = kbA.qnaList
    const qnaListAToCompare = qnaListA.map((qna: any) => {
      return {
        id: qna.id,
        answer: qna.answer,
        source: qna.source,
        questions: qna.questions.slice(),
        metadata: qna.metadata.slice(),
        context: qna.context
      }
    })

    const qnaDocumentsB = kbB.qnaDocuments || []
    const qnaListBToCompare = qnaDocumentsB.map((qna: any) => {
      return {
        id: qna.id,
        answer: qna.answer,
        source: qna.source,
        questions: qna.questions,
        metadata: qna.metadata,
        context: qna.context
      }
    })

    const equal = this.isQnaListEqual(qnaListAToCompare, qnaListBToCompare)

    return equal
  }

  private isQnaListEqual(qnaListA: any, qnaListB: any) {
    let kbAQnA = this.parseToQnAContent(qnaListA).toLowerCase()
    let kbBQnA = this.parseToQnAContent(qnaListB).toLowerCase()

    return kbAQnA === kbBQnA
  }

  private parseToQnAContent(qnaList: any) {
    let fileContent = ''
    qnaList.forEach((qnaItem: any) => {
      fileContent += '<a id = "0"></a>' + NEWLINE + NEWLINE
      fileContent += '> !# @qna.pair.source = ' + qnaItem.source + NEWLINE + NEWLINE
      fileContent += '## ? ' + qnaItem.questions[0] + NEWLINE
      qnaItem.questions.splice(0, 1)
      qnaItem.questions.forEach((question: any) => {
        fileContent += '- ' + question + NEWLINE
      })
      fileContent += NEWLINE
      if (qnaItem.metadata && qnaItem.metadata.length > 0) {
        fileContent += '**Filters:**' + NEWLINE
        qnaItem.metadata.sort((a: any, b: any) => (a.name > b.name) ? 1 : -1).forEach((filter: any) => {
          fileContent += '- ' + filter.name + ' = ' + filter.value + NEWLINE
        })
        fileContent += NEWLINE
      }
      fileContent += '```markdown' + NEWLINE
      fileContent += qnaItem.answer + NEWLINE
      fileContent += '```' + NEWLINE
      if (qnaItem.context && qnaItem.context.prompts && qnaItem.context.prompts.length !== 0) {
        fileContent += NEWLINE + '**Prompts:**' + NEWLINE
        qnaItem.context.prompts.forEach((prompt: any) => {
          fileContent += `- [${prompt.displayText}]`
          // See if the linked prompt is context only and if so, add the decoration.
          let promptQnA = qnaList.find((item: any) => item.id === prompt.qnaId)
          if (promptQnA) {
            fileContent += promptQnA.context.isContextOnly === true ? ' \`context-only\`' : ''
          }
          fileContent += NEWLINE
        })
      }
      fileContent += NEWLINE
    })

    return fileContent
  }
}
