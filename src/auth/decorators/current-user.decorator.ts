import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserResponseDto } from '../dto/auth-response.dto'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserResponseDto => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  },
)

