import styled, { css } from 'styled-components';

import { InterfaceFont, InterfaceTextColor } from '~lib/interface/types';

export const Wrapper = styled.div`
  color: #fff;
  font-family: ${InterfaceFont.PIXEL_TEXT};
  font-size: 15px;
  line-height: 22px;
  letter-spacing: 1px;
  white-space: pre-wrap;
  display: flex;
  flex-direction: column;
  gap: 48px;
`;

export const Alert = styled.div`
  color:rgb(255, 66, 69);
  border: 1px solid #FD2628;
  background:rgba(157, 33, 35, 0.15);
  padding: 10px 14px;
`;

export const Loading = styled.div`
  width: 24px;
  height: 24px;
  background: url('./assets/loading.svg') center center no-repeat;
  background-size: 100%;
  margin: -4px 0 -6px 0;
`;

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
`;

export const Button = styled.div<{
  $disabled?: boolean
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #283C18;
  font-family: ${InterfaceFont.PIXEL_LABEL};
  font-weight: bold;
  font-size: 18px;
  letter-spacing: 1px;
  padding: 18px 38px 20px 38px;
  text-align: center;
  background: #BBF68E;
  border-bottom: 6px solid rgb(56, 85, 32);
  ${(props) => (props.$disabled ? css`
    opacity: 0.5;
    filter: grayscale(0.5);
  ` : css`
    pointer-events: all;
    &:hover {
      background:rgb(161, 236, 103);
      cursor: pointer;
    }
  `)}
`;

export const Balance: any = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

Balance.Label = styled.div`
  text-transform: uppercase;
`;

Balance.Amount = styled.div`
  color: ${InterfaceTextColor.SUCCESS};
`;
