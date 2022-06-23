import { equal } from 'assert';
import { zdorova } from './index';

describe('[zdorova]', () => {
  it('Just works', () => {
    const res = zdorova();
    equal(res, 'zdorova');
  });
});
