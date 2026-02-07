import { ApiProperty } from "@nestjs/swagger";

export class CreateApiKeyResDto {
    @ApiProperty({ type: 'string', example: '02e4018e-2669-4eda-8fe2-bb3ca5cba26e'})
    id: string;

    @ApiProperty({ type: 'string', example: 'tr_896c64949c43ec12cf5e432bb7b789374f924a0ed4b9fadd300f1f2de3db7f38'})
    token: string;

    @ApiProperty({ type: 'string', example: '2026-01-31T20:22:42.819Z' })
    expiresAt: Date;

    @ApiProperty({ type: 'string', example: '2026-01-31T20:22:42.819Z'})
    createdAt: Date;
}
