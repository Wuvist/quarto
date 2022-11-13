/*
 * editor-types.ts
 *
 * Copyright (C) 2022 by Posit Software, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

import { EditorOutline } from 'editor';

export enum EditorActionTypes {
  SET_LOADING = 'EDITOR/SET_LOADING',
  SET_TITLE = 'EDITOR/SET_TITLE',
  SET_MARKDOWN = 'EDITOR/SET_MARKDOWN',
  SET_OUTLINE = 'EDITOR/SET_OUTLINE',
  SET_SELECTION = 'EDITOR/SET_SELECTION',
}

export interface EditorSetLoadingAction {
  type: EditorActionTypes.SET_LOADING;
  loading: boolean;
}

export interface EditorSetTitleAction {
  type: EditorActionTypes.SET_TITLE;
  title: string;
}

export interface EditorSetMarkdownAction {
  type: EditorActionTypes.SET_MARKDOWN;
  markdown: string;
}

export interface EditorSetOutlineAction {
  type: EditorActionTypes.SET_OUTLINE;
  outline: EditorOutline;
}

export interface EditorSetSelectionAction {
  type: EditorActionTypes.SET_SELECTION;
  selection: unknown;
}

export interface EditorState {
  readonly loading: boolean;
  readonly title: string;
  readonly markdown: string;
  readonly outline: EditorOutline;
  readonly selection: unknown;
}

export type EditorActions =
  | EditorSetLoadingAction
  | EditorSetTitleAction
  | EditorSetMarkdownAction
  | EditorSetOutlineAction
  | EditorSetSelectionAction;
