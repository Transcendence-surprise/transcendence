import { ApiProperty } from "@nestjs/swagger";

export class GetApiKeyResDto {
    @ApiProperty({ type: 'string', example: '02e4018e-2669-4eda-8fe2-bb3ca5cba26e'})
    id: string;

    @ApiProperty({ type: 'string', example: 'f500684c2ef365078c2ffa6dceed356cc2bf243eee213bf7c887b0b81ab2d65e'})
    hash: string;

    @ApiProperty({ type: 'string', example: '2026-01-31T20:22:42.819Z' })
    expiresAt: Date;

    @ApiProperty({ type: 'string', example: '2026-01-31T20:22:42.819Z'})
    createdAt: Date;
}
