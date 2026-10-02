import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { registerTemplateHelpers } from './template.helpers';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mjml2html = require('mjml') as (input: string) => { html: string };

@Injectable()
export class TemplateService {
  private templateCache = new Map<string, Handlebars.TemplateDelegate>();

  constructor() {
    registerTemplateHelpers();
  }

  render(template: string, context: Record<string, any>): string {
    const compiled = this.getTemplate(template);

    const mjml: string = compiled(context);

    const result = mjml2html(mjml);

    return result.html;
  }

  private getTemplate(template: string): Handlebars.TemplateDelegate {
    if (this.templateCache.has(template)) {
      return this.templateCache.get(template)!;
    }

    // Resolve relative to this file, not process.cwd(): templates live in
    // src/templates/email during development and are copied to
    // dist/src/templates/email by the Nest build (see nest-cli.json assets),
    // so the same relative path works in both — including the Docker image.
    const templatePath = path.join(
      __dirname,
      '../../../templates/email',
      `${template}.mjml.hbs`,
    );

    const source = fs.readFileSync(templatePath, 'utf8');

    const compiled = Handlebars.compile(source);

    this.templateCache.set(template, compiled);

    return compiled;
  }
}
