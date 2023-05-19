import { CanActivate, Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { i_JWTPayload } from '../interface/jwt';

@Injectable()
export class UnauthorizedJWTGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService, private readonly userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		let payload: i_JWTPayload;

		if (!token) throw new UnauthorizedException('missing JWT');

		try {
			payload = this.jwtService.verify(token);
		} catch (err: any) {
			throw new UnauthorizedException('invalid JWT');
		}

		request['user'] = await this.userService.getMe(payload.id);

		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}

@Injectable()
export class JWTGuard implements CanActivate {
	constructor(private readonly jwtService: JwtService, private readonly userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		let payload: i_JWTPayload;

		if (!token) throw new UnauthorizedException('missing JWT');

		try {
			payload = this.jwtService.verify(token);
		} catch (err: any) {
			throw new UnauthorizedException('invalid JWT');
		}

		request['user'] = await this.userService.getMe(payload.id);

		const { twoFactorEnabled, authorized2fa } = payload;
		const { twoFactorEnabled: userTwoFactorEnabled } = request['user'] || {};

		/*
		unauthorized if:
			- 2fa is enable and 2fa TOTP wasnt yet validated
			- twoFactorEnabled is marked as DISABLE in the token and ENABLE in the DB
		*/
		if ((userTwoFactorEnabled && !authorized2fa) || twoFactorEnabled !== userTwoFactorEnabled) {
			throw new UnauthorizedException('Invalid 2FA');
		}

		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}