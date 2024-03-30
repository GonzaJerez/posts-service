import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    // const token = req.headers.authorization;
    // console.log({ token });

    const client = new LambdaClient();
    const command = new InvokeCommand({
      FunctionName: this.configService.get('AUTH_FUNCTION_NAME'),
      Payload: JSON.stringify({
        version: '2.0',
        routeKey: '$default',
        rawPath: '/auth/checkToken',
        rawQueryString: '',
        queryStringParameters: '',
        headers: req.headers,
        requestContext: {
          http: {
            method: 'GET',
            path: `/auth/checkToken`,
            protocol: 'HTTP/1.1',
          },
        },
      }),
      InvocationType: 'RequestResponse',
    });

    return client
      .send(command)
      .then((res) => {
        const data = Buffer.from(res.Payload).toString();
        const dataParsed = JSON.parse(data);
        console.log({ dataParsed });
        const body = JSON.parse(dataParsed.body);
        console.log({ body });

        const user = body?.user;
        const token = body?.token;

        if (!user || !token) {
          throw new UnauthorizedException();
        }

        context.switchToHttp().getRequest().user = user;
        return true;
      })
      .catch(() => {
        throw new UnauthorizedException();
      });
  }
}
