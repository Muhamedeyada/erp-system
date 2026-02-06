import { SetMetadata } from '@nestjs/common';

export const REQUIRE_MODULE_KEY = 'requireModule';

export const RequireModule = (moduleCode: string) =>
  SetMetadata(REQUIRE_MODULE_KEY, moduleCode);
