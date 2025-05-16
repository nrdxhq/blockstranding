import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';

import type { MenuPage } from '../types';

import { Coins } from './coins';
import { Content } from './content';
import { Navigation } from './navigation';

import { Overlay } from '~scene/system/interface/overlay';

import { Wrapper, Logotype, Sidebar, Main } from './styles';

type Props = {
  defaultPage?: MenuPage;
};

export const MenuUI: React.FC<Props> = ({ defaultPage }) => {
  const [page, setPage] = useState(defaultPage);

  return (
    <Overlay>
      <ToastContainer
        theme="dark"
        position="top-right"
        hideProgressBar={true}
      />
      <Wrapper>
        <Sidebar>
          <Logotype src="assets/logotype.png" />
          <Coins />
          <Navigation page={page} onSelect={setPage} />
        </Sidebar>
        <Main>
          <Content page={page} />
        </Main>
      </Wrapper>
    </Overlay>
  );
};

MenuUI.displayName = 'MenuUI';
