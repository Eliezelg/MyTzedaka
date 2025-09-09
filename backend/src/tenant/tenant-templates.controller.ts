import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { SiteTemplatesService, TemplateType } from './site-templates.service';

@ApiTags('tenant-templates')
@Controller('tenant')
export class TenantTemplatesController {
  constructor(
    private readonly templatesService: SiteTemplatesService,
  ) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get available site templates' })
  @ApiResponse({ status: 200, description: 'List of available templates' })
  async getTemplates() {
    return this.templatesService.getAvailableTemplates();
  }

  @Post(':tenantId/apply-template')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  // @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply a template to a tenant site' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        templateType: {
          type: 'string',
          enum: ['synagogue', 'association', 'community', 'gmah', 'school'],
          description: 'Type of template to apply'
        },
        override: {
          type: 'boolean',
          description: 'Override existing pages and modules',
          default: false
        }
      },
      required: ['templateType']
    }
  })
  @ApiResponse({ status: 200, description: 'Template applied successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async applyTemplate(
    @Param('tenantId') tenantId: string,
    @Body() body: { templateType: TemplateType; override?: boolean }
  ) {
    await this.templatesService.applyTemplate(tenantId, body.templateType);
    return { 
      message: `Template ${body.templateType} applied successfully`,
      note: 'You can now customize the pages and modules through the admin panel'
    };
  }

  @Post(':tenantId/initialize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initialize a new tenant with a template' })
  @ApiParam({ name: 'tenantId', description: 'Tenant ID' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        templateType: {
          type: 'string',
          enum: ['synagogue', 'association', 'community', 'gmah', 'school'],
          description: 'Type of template to use for initialization'
        }
      },
      required: ['templateType']
    }
  })
  @ApiResponse({ status: 200, description: 'Tenant initialized successfully' })
  async initializeTenant(
    @Param('tenantId') tenantId: string,
    @Body() body: { templateType: TemplateType }
  ) {
    await this.templatesService.initializeTenant(tenantId, body.templateType);
    return { 
      message: 'Tenant initialized successfully',
      templateApplied: body.templateType,
      nextSteps: [
        'Customize the home page content',
        'Update contact information',
        'Configure payment settings',
        'Add custom pages if needed',
        'Enable/disable modules as needed'
      ]
    };
  }
}