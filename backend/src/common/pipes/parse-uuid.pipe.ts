import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

/**
 * UUID v4 regex: 8-4-4-4-12 hex digits with version bit = 4
 * and variant bits = 8, 9, a or b.
 */
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * NestJS pipe that validates whether a given string is a valid UUID v4.
 * Throws BadRequestException if the value is not a valid UUID v4.
 *
 * Usage:
 *   @Get(':id')
 *   findOne(@Param('id', ParseUuidPipe) id: string) { ... }
 */
@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!UUID_V4_REGEX.test(value)) {
      throw new BadRequestException(
        `Validation failed: "${value}" is not a valid UUID v4`,
      );
    }
    return value;
  }
}
