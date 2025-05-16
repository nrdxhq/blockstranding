import styled from 'styled-components';

import { INTERFACE_MOBILE_BREAKPOINT } from '~lib/interface/const';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10%;
  @media ${INTERFACE_MOBILE_BREAKPOINT} {
    padding: 0 5%;
  }
`;
