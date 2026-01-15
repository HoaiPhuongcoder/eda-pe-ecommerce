import { StandardResponseDto } from '@/shared/dtos/standard-response.dto';
import { Type } from '@nestjs/common';
import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiStandardResponse = <TModel extends Type<any>>(
  model?: TModel,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponseDto) },
          {
            properties: {
              result: model
                ? { $ref: getSchemaPath(model) }
                : { type: 'object' },
            },
          },
        ],
      },
    }),
  );
};
