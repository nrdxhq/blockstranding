import styled from 'styled-components';

import { InterfaceTextColor } from '~lib/interface/types';

export const Placeholder = styled.div`
  font-weight: bold;
  font-size: 14px;
  opacity: 0.75;
`;

export const Copy = styled.div`
  position: absolute;
  width: 24px;
  height: 24px;
  top: 6px;
  right: 6px;
  background: url('./assets/copy.svg') center center no-repeat;
  background-size: 70%;
  border-radius: 6px;
  &:hover {
    cursor: pointer;
    background-color: rgba(0,0,0,0.5);
  }
`;

export const Field: any = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

Field.Label = styled.div`
  text-transform: uppercase;
  font-size: 13px;
`;

Field.Value = styled.div`
  color: ${InterfaceTextColor.SUCCESS};
  padding: 7px 30px 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  word-break: break-all;
  pointer-events: all;
  user-select: all;
  position: relative;
`;
