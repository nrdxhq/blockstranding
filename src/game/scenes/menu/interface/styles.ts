import styled from 'styled-components';

import { INTERFACE_MOBILE_BREAKPOINT } from '~lib/interface/const';
import { InterfaceBackgroundColor } from '~lib/interface/types';

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  position: absolute;
  inset: 0;
`;

export const Sidebar = styled.div`
  min-width: 30%;
  background: ${InterfaceBackgroundColor.BLACK_TRANSPARENT_25};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  flex: 1;
  padding: 15vh 7vw;
  flex-grow: 0;
  gap: 50px;
  @media ${INTERFACE_MOBILE_BREAKPOINT} {
    gap: 30px;
    padding: 13vh 7vw;
    min-width: 35%;
  }
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  padding: 15vh 7vw;
  @media ${INTERFACE_MOBILE_BREAKPOINT} {
    padding: 13vh 7vw;
  }
`;

export const Logotype = styled.img`
  height: 70px;
`;
