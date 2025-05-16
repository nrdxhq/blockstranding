import styled from 'styled-components';

import { INTERFACE_MOBILE_BREAKPOINT } from '~lib/interface/const';
import { InterfaceFont, InterfaceTextColor } from '~lib/interface/types';

export const Wrapper = styled.div`
  color: #fff;
  font-family: ${InterfaceFont.PIXEL_TEXT};
  font-size: 17px;
  line-height: 22px;
  letter-spacing: 1px;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
  gap: 24px;
  @media ${INTERFACE_MOBILE_BREAKPOINT} {
    font-size: 14px;
    line-height: 18px;
  }
`;

export const Text = styled.div`

`;

export const Light = styled.span`
  color: ${InterfaceTextColor.SUCCESS};
`;

export const Placeholder = styled.div`
  font-size: 70%;
  opacity: 0.5;
`;

export const List: any = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

List.Item = styled.li`
  list-style: none;
  padding-left: 32px;
  background: url('./assets/list-item.png') left center no-repeat;
  background-size: 20px;
`;
