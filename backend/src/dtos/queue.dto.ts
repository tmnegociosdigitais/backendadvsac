import { IsString, IsEnum, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MessagePriority } from '../types/evolution';

export class MessageDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    from: string;

    @IsString()
    @IsNotEmpty()
    to: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    status: string;
}

export class EnqueueMessageDto {
    @ValidateNested()
    @Type(() => MessageDto)
    message: MessageDto;

    @IsString()
    @IsNotEmpty()
    departmentId: string;

    @IsEnum(MessagePriority)
    priority: MessagePriority;
}

export class UpdatePriorityDto {
    @IsString()
    @IsNotEmpty()
    messageId: string;

    @IsString()
    @IsNotEmpty()
    departmentId: string;

    @IsEnum(MessagePriority)
    priority: MessagePriority;
}
