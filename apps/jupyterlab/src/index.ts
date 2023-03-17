/*
* index.ts
*
* Copyright (C) 2020-2023 Posit Software, PBC
*
*/
import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { MarkdownItManager } from './types';
import { mermaid } from './providers/mermaid';
import { kMarkdownItMgr, kPackageNamespace } from './const';
import { footnotes } from './providers/footnotes';

import '../style/index.css';
import { markdownItManager } from './manager';
import { callouts } from './providers/callouts';
import { deflist } from './providers/deflist';
import { figures } from './providers/figures';
import { gridtables } from './providers/gridtables';
import { sub } from './providers/sub';
import { sup } from './providers/sup';
import { tasklists } from './providers/tasklists';
import { citations } from './providers/citations';

const plugin: JupyterFrontEndPlugin<MarkdownItManager> = {
  id: `${kPackageNamespace}:plugin`,
  autoStart: true,
  provides: kMarkdownItMgr,
  activate: (_app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyter_quarto is activated!');

    // Create a markdown rendering manager 
    return markdownItManager();
  }
};


// Markdown It Extensions which provide base Pandoc behavior
const kPandocExtensions = [
  footnotes, // footnote seriously render in the cell in which they appear in :(
  deflist,
  figures,
  gridtables,
  sub,
  sup,
  tasklists
  // TODO: markdown-it-texmath
  // TODO: markdown-it-mathjax3
];

// Markdown It Extensions which provide Quarto specific behavior
const kQuartoExtensions = [
  callouts,
  citations,
  mermaid // TODO mermaid needs to support {} syntax
  // TODO: tabsets
  // TODO: give cites and crossrefs a special treatment
];


// The extensions that should be enabled for Jupyter
export default [plugin, ...kPandocExtensions, ...kQuartoExtensions ];
