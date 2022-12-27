/*
 * EditorPane.tsx
 *
 * Copyright (C) 2019-20 by RStudio, PBC
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

import React from 'react';

import { Pane } from 'editor-ui';

import EditorOutlineSidebar from './outline/EditorOutlineSidebar';
import EditorFind from './EditorFind';
import Editor from './Editor';

import styles from './EditorPane.module.scss';

const EditorPane : React.FC = () => {
  return (
    <Pane className={'editor-pane'}>
      <Editor className={styles.editorParent}>
        <EditorOutlineSidebar />
        <EditorFind />
      </Editor>
    </Pane>
  );
}

export default EditorPane;
