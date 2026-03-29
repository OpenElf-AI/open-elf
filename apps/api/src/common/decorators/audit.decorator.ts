import { SetMetadata } from '@nestjs/common';

export const Audit = (module: string, action: string) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    SetMetadata('module', module)(target, key, descriptor);
    SetMetadata('action', action)(target, key, descriptor);
  };
};
