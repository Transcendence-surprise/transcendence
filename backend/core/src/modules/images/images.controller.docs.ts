import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiParam,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { CreateImageDto } from './dto/create-image.dto';
import { GetImageResDto } from './dto/get-image-res.dto';
import { UpdateImageDto } from './dto/update-image.dto';

const ImagesControllerDocs = () => ApiTags('Images');

const FindAllImagesDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get all images',
      description: 'Retrieve a list of all uploaded images',
      operationId: 'getImages',
    }),
    ApiOkResponse({
      description: 'List of images',
      type: GetImageResDto,
      isArray: true,
    }),
  );

const FindImageByIdDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get image by ID',
      description: 'Retrieve image metadata by image ID',
      operationId: 'getImageById',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Image ID',
      example: 1,
    }),
    ApiOkResponse({
      description: 'Image metadata returned',
      type: GetImageResDto,
    }),
    ApiNotFoundResponse({ description: 'Image not found' }),
  );

const UploadImageDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Upload an image',
      description: 'Upload image data via multipart/form-data',
      operationId: 'uploadImage',
    }),
    ApiBody({
      description: 'Image file as form-data (field name `file`)',
      type: CreateImageDto,
    }),
    ApiCreatedResponse({
      description: 'Image uploaded successfully',
      type: GetImageResDto,
    }),
    ApiBadRequestResponse({ description: 'Missing or invalid file' }),
  );

const UpdateImageDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update image metadata',
      description: 'Update image metadata (filename, mimeType, size or url)',
      operationId: 'updateImage',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Image ID to update',
      example: 1,
    }),
    ApiBody({
      description: 'Fields to update',
      type: UpdateImageDto,
    }),
    ApiOkResponse({
      description: 'Image updated successfully',
      type: GetImageResDto,
    }),
    ApiBadRequestResponse({ description: 'Invalid request data' }),
    ApiNotFoundResponse({ description: 'Image not found' }),
  );

const RemoveImageDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete image',
      description: 'Delete image by ID',
      operationId: 'deleteImage',
    }),
    ApiParam({
      name: 'id',
      type: 'number',
      description: 'Image ID to delete',
      example: 1,
    }),
    ApiNoContentResponse({ description: 'Image deleted successfully' }),
    ApiNotFoundResponse({ description: 'Image not found' }),
  );

export {
  ImagesControllerDocs,
  FindAllImagesDocs,
  FindImageByIdDocs,
  UploadImageDocs,
  UpdateImageDocs,
  RemoveImageDocs,
};
