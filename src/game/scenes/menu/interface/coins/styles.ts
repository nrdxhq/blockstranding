import styled from 'styled-components';

import { InterfaceFont } from '~lib/interface/types';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Icon = styled.img`

`;

export const Value = styled.div`
  color: #fff;
  font-family: ${InterfaceFont.PIXEL_LABEL};
  font-size: 22px;
  font-weight: bold;
`;
