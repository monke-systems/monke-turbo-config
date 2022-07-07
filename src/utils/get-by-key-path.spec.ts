import { getByKeyPath } from './get-by-key-path';

describe('Get by key path spec', () => {
  it('Should correctly pick value', () => {
    const obj = {
      opa: {
        zhopa: {
          lo: 'result',
        },
      },
    };

    const res = getByKeyPath(obj, 'opa.zhopa.lo');

    expect(res).toBe('result');
  });
});
