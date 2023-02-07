/*
 * theme.ts
 *
 * Copyright (C) 2022 by Posit Software, PBC
 *
 * Unless you have received this program directly from Posit Software pursuant
 * to the terms of a commercial license agreement with Posit Software, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */


import { EditorView } from "@codemirror/view";
import { Compartment } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";

import {tags as t} from "@lezer/highlight"

import { StyleSpec } from 'style-mod';

import { CodeViewOptions, EditorTheme, ThemeChangedEvent } from "editor";

import { Behavior, BehaviorContext } from ".";


export function themeBehavior(context: BehaviorContext) : Behavior {

  const themeConf = new Compartment();

  const setTheme = (cmView: EditorView) => {
    
    const editorTheme = context.pmContext.theme();
    const extensions = [
      codemirrorTheme(editorTheme, context.options), 
      syntaxHighlighting(codemirrorHighlightStyle(editorTheme))
    ];

    cmView.dispatch({
      effects: themeConf.reconfigure(extensions)
    });
  };

  let unsubscribe: VoidFunction;

  return {
    extensions: [themeConf.of([])],

    init: (_pmNode, cmView: EditorView) => {
      setTheme(cmView);
      unsubscribe = context.pmContext.events.subscribe(ThemeChangedEvent, () => {
        setTheme(cmView);
      })
    },

    cleanup: () => unsubscribe?.()
  }
}

function codemirrorTheme(editorTheme: EditorTheme, options: CodeViewOptions) {

  const styleSpec : { [selector: string]: StyleSpec} = {
    "&": {
      color: editorTheme.textColor,
      backgroundColor: options.classes?.includes('pm-chunk-background-color')  
        ? editorTheme.chunkBackgroundColor
        : editorTheme.backgroundColor,
      border: "none",
      fontSize: `${editorTheme.fixedWidthFontSizePt}pt`
    },

    "&.cm-editor.cm-focused": {
      outline: `1px solid ${editorTheme.focusOutlineColor}`
    },

    ".cm-content": {
      fontFamily: `${editorTheme.fixedWidthFont}`,
      caretColor: editorTheme.cursorColor
    },
  
    ".cm-cursor, .cm-dropCursor": {borderLeftColor: editorTheme.cursorColor},
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {backgroundColor: editorTheme.selectionColor},
  
    ".cm-panels": {backgroundColor: editorTheme.gutterBackgroundColor, color: editorTheme.gutterTextColor},
    ".cm-panels.cm-panels-top": {borderBottom: `2px solid ${editorTheme.paneBorderColor}`},
    ".cm-panels.cm-panels-bottom": {borderTop:`2px solid ${editorTheme.paneBorderColor}`},
  
    ".cm-searchMatch": {
      backgroundColor: editorTheme.findTextBackgroundColor,
      outline: `1px solid${editorTheme.findTextBorderColor}`
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: editorTheme.findTextBackgroundColor
    },
  
    ".cm-activeLine": {backgroundColor: editorTheme.backgroundColor},
    ".cm-selectionMatch": {backgroundColor: editorTheme.findTextBackgroundColor},
  
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: editorTheme.findTextBackgroundColor
    },
  
    ".cm-gutters": {
      backgroundColor: editorTheme.gutterBackgroundColor,
      color: editorTheme.gutterTextColor,
      border: "none",
      paddingRight: "6px",
      fontFamily: editorTheme.fixedWidthFont,
      fontSize: `${editorTheme.fixedWidthFontSizePt}pt`
    },
  
    ".cm-activeLineGutter": {
      backgroundColor: editorTheme.backgroundColor
    },
  
    ".cm-foldPlaceholder": {
      backgroundColor: "transparent",
      border: "none",
      color: editorTheme.lightTextColor
    },
  
    ".cm-tooltip": {
      border: "none",
      backgroundColor: editorTheme.backgroundColor
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent"
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: editorTheme.paneBorderColor,
      borderBottomColor: editorTheme.paneBorderColor
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: editorTheme.spanBackgroundColor,
        color: editorTheme.textColor
      }
    }
  };

  if (options.firstLineMeta) {
    styleSpec[".cm-content .cm-line:first-of-type, .cm-content .cm-line:first-of-type span"] = {
      color: editorTheme.lightTextColor
    };
  }
  
  return EditorView.theme(styleSpec, {dark: editorTheme.darkMode});

}

// map vscode theme names to highlight themes
const vscodeThemes: Record<string,HighlightStyle> = {
  "Light (Visual Studio)": lightHighlightStyle(),
  "Light+ (default light)": lightPlusHighlightStyle(),
  "Light+ V2 (Experimental)": lightPlusV2HighlightStyle(),
  "Quiet Light": quietLightHighlightStyle(),
  "Solarized Light": solarizedLightHighlightStyle(),
  "Abyss": darkPlusHighlightStyle(), // abyssHighlightStyle(),
  "Dark (Visual Studio)": darkHighlightStyle(),
  "Dark+ (default dark)": darkPlusHighlightStyle(),
  "Dark+ V2 (Experimental)": darkPlusV2HighlightStyle(),
  "Kimbie Dark": darkPlusHighlightStyle(), // kimbieDarkHighlightStyle(),
  "Monokai Dimmed": monokaiDimmedHighlightStyle(),
  "Monokai": monokaiHighlightStyle(),
  "Red": redHighlightStyle(),
  "Solarized Dark": solarizedDarkHighlightStyle(),
  "Tomorrow Night Blue": tomorrowNightBlueHighlightStyle(),
  "Dark High Contrast": highContrastDarkHighlightStyle(),
  "Light High Contrast": highContrastLightHighlightStyle(),
};


function codemirrorHighlightStyle(editorTheme: EditorTheme) {

  // first use active vscode theme (if available)
  const vscodeTheme = document.body.getAttribute('data-vscode-theme-name');
  if (vscodeTheme) {
    const HighlightStyle = vscodeThemes[vscodeTheme];
    if (HighlightStyle) {
      return HighlightStyle;
    } 
  }

  // otherwise use default logic
  if (editorTheme.solarizedMode) {
    return solarizedLightHighlightStyle();
  } else {
    const colors = editorTheme.darkMode ? vscodeDarkHighlightColors : vscodeLightHighlightColors;
    return  HighlightStyle.define([
      {tag: [t.operator, t.operatorKeyword, t.brace], color: colors.operator },
      {tag: [t.heading], color: colors.heading},
      {tag: [t.meta,t.comment], color: colors.comment},
      {tag: [t.keyword, t.moduleKeyword], color: colors.keyword},
      {tag: [t.number], color: colors.number},
      {tag: [t.regexp], color: colors.regexp},
      {tag: [t.definition(t.name)], colors: colors.definition},
      {tag: [t.invalid], color: colors.invalid},
      {tag: [t.string], color: colors.string},
      {tag: [t.bracket, t.angleBracket, t.squareBracket], color: colors.bracket},
      {tag: [t.function(t.variableName)], color: colors.function},
      {tag: [t.className], color: colors.className},
      {tag: [t.controlKeyword], color: colors.controlKeyword},
      {tag: [t.variableName], color: colors.variableName}
    ]);
  }
  
}


interface CodeMirrorHighlightColors {
  operator: string;
  heading: string;
  comment: string;
  keyword: string;
  number: string; // also constant
  regexp: string;
  definition: string;
  invalid: string;
  string: string;
  bracket: string;
  function: string;
  className: string;
  controlKeyword: string;
  variableName: string;
}


// vscode light
const vscodeLightHighlightColors: CodeMirrorHighlightColors = {
  operator: "#000000",
  heading: "#000080",
  comment: "#008000",
  keyword: "#0000ff",
  number: "#098658",
  regexp: "#811f3f",
  definition: "#001080",
  invalid: "#cd3131",
  string: "#a31515",
  bracket: "#000000",
  function: "#795e26",
  className: "#267f99",
  controlKeyword: "#af00db",
  variableName: "#0070c1"
}



// vscode dark
const vscodeDarkHighlightColors: CodeMirrorHighlightColors = {
  operator: "#d4d4d4",
  heading: "#000080",
  comment: "#6a9955",
  keyword: "#569cd6",
  number: "#b5cea8",
  regexp: "#646695",
  definition: "#9cdcfe",
  invalid: "#f44747",
  string: "#ce9178",
  bracket: "#808080",
  function: "#dcdcaa",
  className: "#4ec9b0",
  controlKeyword: "#c586c0",
  variableName: "#4fc1ff"
}


function abyssHighlightStyle() {
  const config = {
    name: 'abyss',
    dark: true,
    background: '#000c18',
    foreground: '#6688cc',
    selection: '#770811',
    cursor: '#ddbb88',
    dropdownBackground: '#000c18',
    dropdownBorder: '#454545',
    activeLine: '#082050',
    matchingBracket: '#082050',
    keyword: '#225588',
    storage: '#225588',
    variable: '#2277ff',
    parameter: '#2277ff',
    function: '#ddbb88',
    string: '#22aa44',
    constant: '#f280d0',
    type: '#ffeebb',
    class: '#ffeebb',
    number: '#f280d0',
    comment: '#384887',
    heading: '#6688cc',
    invalid: '#A22D44',
    regexp: '#22aa44',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}


function darkHighlightStyle() {
  const config = {
    name: 'dark',
    dark: true,
    background: '#1E1E1E',
    foreground: '#D4D4D4',
    selection: '#264F78',
    cursor: '#BBBBBB',
    dropdownBackground: '#1E1E1E',
    dropdownBorder: '#454545',
    activeLine: '#264F78',
    matchingBracket: '#0064001a',
    keyword: '#569cd6',
    storage: '#569cd6',
    variable: '#569cd6',
    parameter: '#BBBBBB',
    function: '#dcdcaa',
    string: '#ce9178',
    constant: '#BBBBBB',
    type: '#4ec9b0',
    class: '#4ec9b0',
    number: '#b5cea8',
    comment: '#6A9955',
    heading: '#569cd6',
    invalid: '#f44747',
    regexp: '#d16969',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}


function darkPlusHighlightStyle() {
  const config = {
    name: 'darkPlus',
    dark: true,
    background: '#1E1E1E',
    foreground: '#BBBBBB',
    selection: '#264F78',
    cursor: '#BBBBBB',
    dropdownBackground: '#252526',
    dropdownBorder: '#454545',
    activeLine: '#264F78',
    matchingBracket: '#0064001a',
    keyword: '#569cd6',
    storage: '#569cd6',
    variable: '#9CDCFE',
    parameter: '#9CDCFE',
    function: '#DCDCAA',
    string: '#ce9178',
    constant: '#569cd6',
    type: '#4EC9B0',
    class: '#4EC9B0',
    number: '#b5cea8',
    comment: '#6a9955',
    heading: '#000080',
    invalid: '#f44747',
    regexp: '#646695',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}


function darkPlusV2HighlightStyle() {
  const config = {
    name: 'darkPlusV2',
    dark: true,
    background: '#1f1f1f',
    foreground: '#ffffffc5',
    selection: '#264F78',
    cursor: '#ffffffc5',
    dropdownBackground: '#1f1f1f',
    dropdownBorder: '#ffffff17',
    activeLine: '#264F78',
    matchingBracket: '#0064001a',
    keyword: '#569cd6',
    storage: '#569cd6',
    variable: '#ffffffc5',
    parameter: '#BBBBBB',
    function: '#dcdcaa',
    string: '#ce9178',
    constant: '#BBBBBB',
    type: '#4ec9b0',
    class: '#4ec9b0',
    number: '#b5cea8',
    comment: '#6a9955',
    heading: '#000080',
    invalid: '#f85149',
    regexp: '#646695',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}

function highContrastDarkHighlightStyle() {
  const config = {
    name: 'highContrastDark',
    dark: true,
    background: '#000000',
    foreground: '#FFFFFF',
    selection: '#FFFFFF',
    cursor: '#ffffff',
    dropdownBackground: '#000000',
    dropdownBorder: '#6FC3DF',
    activeLine: '#FFFFFF',
    matchingBracket: '#FFFFFF',
    keyword: '#569cd6',
    storage: '#569cd6',
    variable: '#9CDCFE',
    parameter: '#9CDCFE',
    function: '#DCDCAA',
    string: '#ce9178',
    constant: '#569cd6',
    type: '#4EC9B0',
    class: '#4EC9B0',
    number: '#b5cea8',
    comment: '#7ca668',
    heading: '#6796e6',
    invalid: '#f44747',
    regexp: '#d16969',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}

function highContrastLightHighlightStyle() {
  const config = {
    name: 'highContrastLight',
    dark: false,
    background: '#ffffff',
    foreground: '#292929',
    selection: '#0F4A85',
    cursor: '#292929',
    dropdownBackground: '#ffffff',
    dropdownBorder: '#0F4A85',
    activeLine: '#0F4A85',
    matchingBracket: '#0000',
    keyword: '#0F4A85',
    storage: '#0F4A85',
    variable: '#001080',
    parameter: '#001080',
    function: '#5e2cbc',
    string: '#0F4A85',
    constant: '#0F4A85',
    type: '#185E73',
    class: '#185E73',
    number: '#096d48',
    comment: '#515151',
    heading: '#0F4A85',
    invalid: '#B5200D',
    regexp: '#811F3F',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}

function kimbieDarkHighlightStyle() {
  const config = {
    name: 'kimbieDark',
    dark: true,
    background: '#221a0f',
    foreground: '#d3af86',
    selection: '#84613daa',
    cursor: '#d3af86',
    dropdownBackground: '#221a0f',
    dropdownBorder: '#454545',
    activeLine: '#5e452b',
    matchingBracket: '#5e452b',
    keyword: '#98676a',
    storage: '#98676a',
    variable: '#dc3958',
    parameter: '#dc3958',
    function: '#8ab1b0',
    string: '#889b4a',
    constant: '#f79a32',
    type: '#f06431',
    class: '#f06431',
    number: '#f79a32',
    comment: '#a57a4c',
    heading: '#8ab1b0',
    invalid: '#dc3958',
    regexp: '#7e602c',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}

function lightHighlightStyle() {
  const config = {
    name: 'light',
    dark: false,
    background: '#FFFFFF',
    foreground: '#000000',
    selection: '#ADD6FF',
    cursor: '#333333',
    dropdownBackground: '#FFFFFF',
    dropdownBorder: '#C8C8C8',
    activeLine: '#ADD6FF',
    matchingBracket: '#0064001a',
    keyword: '#0000ff',
    storage: '#0000ff',
    variable: '#0000ff',
    parameter: '#333333',
    function: '#795e26',
    string: '#a31515',
    constant: '#333333',
    type: '#267f99',
    class: '#267f99',
    number: '#098658',
    comment: '#008000',
    heading: '#800000',
    invalid: '#cd3131',
    regexp: '#811f3f',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}

function lightPlusHighlightStyle() {
  const config = {
    name: 'lightPlus',
    dark: false,
    background: '#ffffff',
    foreground: '#333333',
    selection: '#ADD6FF',
    cursor: '#333333',
    dropdownBackground: '#F3F3F3',
    dropdownBorder: '#C8C8C8',
    activeLine: '#ADD6FF',
    matchingBracket: '#0064001a',
    keyword: '#0000ff',
    storage: '#0000ff',
    variable: '#001080',
    parameter: '#001080',
    function: '#795E26',
    string: '#a31515',
    constant: '#0000ff',
    type: '#267f99',
    class: '#267f99',
    number: '#098658',
    comment: '#008000',
    heading: '#000080',
    invalid: '#cd3131',
    regexp: '#811f3f',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}

function lightPlusV2HighlightStyle() {
  const config = {
    name: 'lightPlusV2',
    dark: false,
    background: '#ffffff',
    foreground: '#000000e4',
    selection: '#ADD6FF',
    cursor: '#000000e4',
    dropdownBackground: '#ffffff',
    dropdownBorder: '#0000001a',
    activeLine: '#ADD6FF',
    matchingBracket: '#0064001a',
    keyword: '#0000ff',
    storage: '#0000ff',
    variable: '#000000e4',
    parameter: '#333333',
    function: '#795e26',
    string: '#a31515',
    constant: '#333333',
    type: '#267f99',
    class: '#267f99',
    number: '#098658',
    comment: '#008000',
    heading: '#000080',
    invalid: '#f85149',
    regexp: '#811f3f',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}


function monokaiHighlightStyle() {
  const config = {
    name: 'monokai',
    dark: true,
    background: '#272822',
    foreground: '#f8f8f2',
    selection: '#878b9180',
    cursor: '#f8f8f0',
    dropdownBackground: '#272822',
    dropdownBorder: '#75715E',
    activeLine: '#3e3d32',
    matchingBracket: '#3e3d32',
    keyword: '#F92672',
    storage: '#F92672',
    variable: '#F8F8F2',
    parameter: '#FD971F',
    function: '#A6E22E',
    string: '#E6DB74',
    constant: '#AE81FF',
    type: '#A6E22E',
    class: '#A6E22E',
    number: '#AE81FF',
    comment: '#88846f',
    heading: '#A6E22E',
    invalid: '#F44747',
    regexp: '#E6DB74',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}

function redHighlightStyle() {
  const config = {
    name: 'red',
    dark: true,
    background: '#390000',
    foreground: '#F8F8F8',
    selection: '#750000',
    cursor: '#970000',
    dropdownBackground: '#390000',
    dropdownBorder: '#220000',
    activeLine: '#ff000033',
    matchingBracket: '#ff000033',
    keyword: '#f12727ff',
    storage: '#ff6262ff',
    variable: '#fb9a4bff',
    parameter: '#fb9a4bff',
    function: '#ffb454ff',
    string: '#cd8d8dff',
    constant: '#994646ff',
    type: '#9df39fff',
    class: '#fec758ff',
    number: '#994646ff',
    comment: '#e7c0c0ff',
    heading: '#fec758ff',
    invalid: '#ffffffff',
    regexp: '#ffb454ff',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}


function monokaiDimmedHighlightStyle() {
  const config = {
    name: 'monokaiDimmed',
    dark: true,
    background: '#1e1e1e',
    foreground: '#c5c8c6',
    selection: '#676b7180',
    cursor: '#c07020',
    dropdownBackground: '#1e1e1e',
    dropdownBorder: '#454545',
    activeLine: '#303030',
    matchingBracket: '#303030',
    keyword: '#6089B4',
    storage: '#9872A2',
    variable: '#6089B4',
    parameter: '#6089B4',
    function: '#CE6700',
    string: '#9AA83A',
    constant: '#8080FF',
    type: '#9B0000',
    class: '#9B0000',
    number: '#6089B4',
    comment: '#9A9B99',
    heading: '#D0B344',
    invalid: '#FF0B00',
    regexp: '#9AA83A',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}

function quietLightHighlightStyle() {
  const config = {
    name: 'quietLight',
    dark: false,
    background: '#F5F5F5',
    foreground: '#333333',
    selection: '#C9D0D9',
    cursor: '#54494B',
    dropdownBackground: '#F5F5F5',
    dropdownBorder: '#C8C8C8',
    activeLine: '#E4F6D4',
    matchingBracket: '#E4F6D4',
    keyword: '#4B69C6',
    storage: '#4B69C6',
    variable: '#7A3E9D',
    parameter: '#7A3E9D',
    function: '#AA3731',
    string: '#448C27',
    constant: '#9C5D27',
    type: '#7A3E9D',
    class: '#267f99',
    number: '#9C5D27',
    comment: '#AAAAAA',
    heading: '#AA3731',
    invalid: '#cd3131',
    regexp: '#4B69C6',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}

function solarizedDarkHighlightStyle() {
  const config = {
    name: 'solarizedDark',
    dark: true,
    background: '#002B36',
    foreground: '#93A1A1',
    selection: '#274642',
    cursor: '#D30102',
    dropdownBackground: '#002B36',
    dropdownBorder: '#2AA19899',
    activeLine: '#073642',
    matchingBracket: '#073642',
    keyword: '#859900',
    storage: '#93A1A1',
    variable: '#268BD2',
    parameter: '#268BD2',
    function: '#268BD2',
    string: '#2AA198',
    constant: '#CB4B16',
    type: '#CB4B16',
    class: '#CB4B16',
    number: '#D33682',
    comment: '#586E75',
    heading: '#268BD2',
    invalid: '#DC322F',
    regexp: '#DC322F',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}

function solarizedLightHighlightStyle() {
  const config = {
    name: 'solarizedLight',
    dark: false,
    background: '#FDF6E3',
    foreground: '#586E75',
    selection: '#EEE8D5',
    cursor: '#657B83',
    dropdownBackground: '#FDF6E3',
    dropdownBorder: '#D3AF86',
    activeLine: '#EEE8D5',
    matchingBracket: '#EEE8D5',
    keyword: '#859900',
    storage: '#586E75',
    variable: '#268BD2',
    parameter: '#268BD2',
    function: '#268BD2',
    string: '#2AA198',
    constant: '#CB4B16',
    type: '#CB4B16',
    class: '#CB4B16',
    number: '#D33682',
    comment: '#93A1A1',
    heading: '#268BD2',
    invalid: '#DC322F',
    regexp: '#DC322F',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}


function tomorrowNightBlueHighlightStyle() {
  const config = {
    name: 'tomorrowNightBlue',
    dark: true,
    background: '#002451',
    foreground: '#ffffff',
    selection: '#003f8e',
    cursor: '#ffffff',
    dropdownBackground: '#002451',
    dropdownBorder: '#454545',
    activeLine: '#00346e',
    matchingBracket: '#00346e',
    keyword: '#EBBBFF',
    storage: '#EBBBFF',
    variable: '#FF9DA4',
    parameter: '#FF9DA4',
    function: '#BBDAFF',
    string: '#D1F1A9',
    constant: '#FFC58F',
    type: '#FFEEAD',
    class: '#FFEEAD',
    number: '#FFC58F',
    comment: '#7285B7',
    heading: '#D1F1A9',
    invalid: '#a92049',
    regexp: '#D1F1A9',
  };
  return HighlightStyle.define([ 
    {tag: t.keyword, color: config.keyword},
    {tag: [t.name, t.deleted, t.character, t.macroName], color: config.variable},
    {tag: [t.propertyName], color: config.function},
    {tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)], color: config.string},
    {tag: [t.function(t.variableName), t.labelName], color: config.function},
    {tag: [t.color, t.constant(t.name), t.standard(t.name)], color: config.constant},
    {tag: [t.definition(t.name), t.separator], color: config.variable},
    {tag: [t.className], color: config.class},
    {tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace], color: config.number},
    {tag: [t.typeName], color: config.type, fontStyle: config.type},
    {tag: [t.operator, t.operatorKeyword], color: config.keyword},
    {tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp},
    {tag: [t.meta, t.comment], color: config.comment},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
    {tag: t.link, textDecoration: 'underline'},
    {tag: t.heading, fontWeight: 'bold', color: config.heading},
    {tag: [t.atom, t.bool, t.special(t.variableName)], color: config.variable},
    {tag: t.invalid, color: config.invalid},
    {tag: t.strikethrough, textDecoration: 'line-through'},
  ]);
}



