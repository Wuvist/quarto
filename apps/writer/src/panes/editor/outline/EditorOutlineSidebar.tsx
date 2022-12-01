/*
 * EditorOutlineSidebar.tsx
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

import React, { useContext, useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { CSSTransition } from 'react-transition-group';

import { useTranslation } from 'react-i18next';


import { CommandManagerContext } from '../../../commands/CommandManager';
import { WorkbenchCommandId } from '../../../commands/commands';

import { EditorOutlineButton } from './EditorOutlineButton';
import { EditorOutlineHeader } from './EditorOutlineHeader';
import { EditorOutlineTree } from './EditorOutlineTree';
import { EditorOutlineEmpty } from './EditorOutlineEmpty';

import styles from './EditorOutlineSidebar.module.scss';
import transition from './EditorOutlineTransition.module.scss';
import { editorOutline } from '../../../store/editor';
import { useGetPrefsQuery, useSetPrefsMutation } from '../../../store/prefs';
import { defaultPrefs } from 'writer-types';

const EditorOutlineSidebar: React.FC = () => {

  const { t } = useTranslation();
  const [, cmDispatch] = useContext(CommandManagerContext);

  const outline = useSelector(editorOutline);

  const { data: prefs = defaultPrefs() } = useGetPrefsQuery();
  const [setPrefs] = useSetPrefsMutation();
 
  const [animating, setAnimating] = useState(false);

  const setShowOutline = (showOutline: boolean) => setPrefs({...prefs, showOutline});

  const onOpenClicked = () => setShowOutline(true);
  const onCloseClicked= () => setShowOutline(false);

  // update command when showOutline changes
  useEffect(() => {
    cmDispatch({ type: "ADD_COMMANDS", payload: [
      {
        id: WorkbenchCommandId.ShowOutline,
        menuText: t('commands:show_outline_menu_text'),
        group: t('commands:group_view'),
        keymap: ['Ctrl-Alt-O'],
        isEnabled: () => true,
        isActive: () => prefs.showOutline,
        execute: () => {
          setShowOutline(!prefs.showOutline);
        },
      },
    ]})
  }, [prefs.showOutline])

  const outlineClassName = [styles.outline];
    if (prefs.showOutline) {
      outlineClassName.push(styles.outlineVisible);
    }

  return (
    <>
        <EditorOutlineButton visible={!prefs.showOutline} onClick={onOpenClicked} />
        <CSSTransition in={prefs.showOutline} timeout={200} classNames={{ ...transition }} 
          onEnter={() => setAnimating(true)}
          onEntered={() => setAnimating(false)}
          onExit={() => setAnimating(true)}
          onExited={() => setAnimating(false)}
        >            
          <div className={outlineClassName.join(' ')}>
            <EditorOutlineHeader onCloseClicked={onCloseClicked} />
            {outline.length ? <EditorOutlineTree outline={outline} /> : !animating ? <EditorOutlineEmpty /> : null}
          </div>
        </CSSTransition>
      </>
  );
}

export default EditorOutlineSidebar;