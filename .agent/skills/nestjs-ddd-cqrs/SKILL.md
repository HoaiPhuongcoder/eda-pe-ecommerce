---
name: NestJS DDD/CQRS Architecture
description: Implement features following Domain-Driven Design (DDD) and CQRS patterns with event-driven architecture, Kafka, and BullMQ
---

# NestJS DDD/CQRS Architecture Skill

This skill guides implementation of new features in a NestJS application using **Domain-Driven Design (DDD)**, **CQRS (Command Query Responsibility Segregation)**, and **Event-Driven Architecture**.

## Architecture Overview

### Tech Stack

- **Framework**: NestJS
- **ORM**: Prisma
- **Message Broker**: Kafka (for inter-module events)
- **Job Queue**: BullMQ (for async tasks like emails)
- **Email Service**: Resend
- **Database**: PostgreSQL
- **Patterns**: DDD, CQRS, Event Sourcing, Outbox Pattern

### Module Structure

Each module follows Clean Architecture / DDD layering:

```
src/modules/{module-name}/
├── domain/                    # Business logic layer
│   ├── aggregates/           # Aggregate roots (business entities)
│   ├── value-objects/        # Immutable value objects
│   ├── events/               # Domain events
│   ├── repositories/         # Repository interfaces (ports)
│   ├── exceptions/           # Domain-specific exceptions
│   └── enums/                # Domain constants
├── application/               # Use cases layer
│   ├── commands/             # CQRS commands
│   ├── queries/              # CQRS queries (if needed)
│   ├── handlers/             # Command/Query/Event handlers
│   ├── dtos/                 # Data transfer objects
│   └── ports/                # Application interfaces
├── infrastructure/            # Technical implementations
│   ├── prisma/               # Prisma repository implementations
│   ├── adapters/             # External service adapters
│   ├── jobs/                 # Outbox workers, cron jobs
│   └── kafka/                # Kafka producers/consumers
├── presentation/              # Interface layer
│   ├── http/                 # REST controllers
│   └── event-consumers/      # Kafka event consumers
└── {module}.module.ts         # Module configuration
```

## Key Patterns

### 1. Aggregate Pattern

Aggregates are the core of your domain model. They:

- Encapsulate business logic
- Maintain invariants
- Emit domain events
- Have a unique ID and lifecycle

**Example Structure**:

```typescript
export class AuthUser extends AggregateRoot {
  private constructor(
    private _id: string,
    private _email: Email,
    // ... other properties
  ) {
    super();
  }

  // Factory method for creation
  static register(...): AuthUser {
    const user = new AuthUser(...);
    user.apply(new UserRegisteredEvent(...));
    return user;
  }

  // Factory method for reconstruction from DB
  static restore(...): AuthUser {
    return new AuthUser(...);
  }

  // Domain methods that maintain business rules
  verifyOtp(code: string): void {
    // Validate business rules
    // Emit domain event
    this.apply(new UserVerifiedEvent(...));
  }
}
```

### 2. Value Objects

Immutable objects that represent domain concepts:

```typescript
export class Email {
  constructor(private readonly _value: string) {
    // Validation in constructor
    if (!this.isValid(_value)) {
      throw new InvalidEmailException();
    }
  }

  get value(): string {
    return this._value;
  }

  private isValid(email: string): boolean {
    // Validation logic
  }
}
```

### 3. CQRS Pattern

Separate read and write operations:

**Commands** (Write):

```typescript
// Command
export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

// Handler
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  async execute(command: RegisterUserCommand): Promise<void> {
    // 1. Create value objects
    // 2. Create aggregate
    // 3. Save via repository
  }
}
```

**Queries** (Read) - separate if needed.

### 4. Event-Driven Architecture

**Domain Events** (within module):

```typescript
export class UserRegisteredEvent extends DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly otp: string,
  ) {
    super({ aggregateId });
  }
}
```

**Flow**: Aggregate → Domain Event → Outbox → Kafka → Event Consumer → Event Handler

### 5. Outbox Pattern

Ensures reliable event publishing:

1. Save aggregate + events in same transaction
2. Cron job (every 5s) publishes pending events to Kafka
3. Events marked as PUBLISHED after successful send

**Repository Implementation**:

```typescript
async save(aggregate: Aggregate): Promise<void> {
  const domainEvents = aggregate.getUncommittedEvents();

  await this.prisma.$transaction(async (tx) => {
    // Save aggregate
    await tx.user.upsert(...);

    // Save events to outbox
    for (const event of domainEvents) {
      await tx.integrationEventOutbox.create({
        data: {
          type: event.constructor.name,
          payload: event,
          status: OutboxStatus.PENDING,
        },
      });
    }
  });

  aggregate.commit();
}
```

### 6. Cross-Module Communication

**Auth Module** (produces) → **Notification Module** (consumes):

1. **Auth emits event**: `UserRegisteredEvent`
2. **Outbox worker**: Publishes to Kafka
3. **Notification consumer**: Receives from Kafka
4. **Notification handler**: Processes event (queue email)
5. **BullMQ worker**: Sends email

## Implementation Checklist

### Adding a New Command/Feature

#### Step 1: Domain Layer

- [ ] Create domain event in `domain/events/`
- [ ] Add business method to aggregate in `domain/aggregates/`
- [ ] Create value objects if needed in `domain/value-objects/`
- [ ] Add custom exceptions in `domain/exceptions/`

#### Step 2: Application Layer

- [ ] Create command in `application/commands/`
- [ ] Create DTO in `application/dtos/`
- [ ] Create command handler in `application/handlers/`
- [ ] Inject required repositories/ports

#### Step 3: Presentation Layer

- [ ] Add endpoint in `presentation/http/{controller}.ts`
- [ ] Use `@ResponseMessage()` decorator
- [ ] Execute command via `CommandBus`

#### Step 4: Registration

- [ ] Register handler in `{module}.module.ts` providers

#### Step 5: Cross-Module Events (if needed)

**If event should trigger actions in other modules:**

**In Notification Module:**

- [ ] Create domain event in `notification/domain/events/`
- [ ] Create DTO in `notification/application/dtos/`
- [ ] Create event handler in `notification/application/handlers/`
- [ ] Add `@EventPattern()` in `event-consumers/auth-events.controller.ts`
- [ ] Register handler in `notification.module.ts`

## Code Templates

### Complete Feature Implementation Template

```typescript
// ============================================
// DOMAIN LAYER
// ============================================

// domain/events/feature-executed.event.ts
import { DomainEvent } from '@/shared';

export class FeatureExecutedEvent extends DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly data: string,
  ) {
    super({ aggregateId });
  }
}

// domain/aggregates/entity.aggregate.ts
executeFeature(data: ValueObject): void {
  // Validate business rules
  if (!this.canExecute()) {
    throw new BusinessRuleException();
  }

  // Update state
  this._data = data;

  // Emit event
  this.apply(new FeatureExecutedEvent(this.id, data.value));
}

// ============================================
// APPLICATION LAYER
// ============================================

// application/commands/execute-feature.command.ts
export class ExecuteFeatureCommand {
  constructor(public readonly data: string) {}
}

// application/dtos/execute-feature.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class ExecuteFeatureDto {
  @IsString()
  @IsNotEmpty()
  data: string;
}

// application/handlers/execute-feature.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(ExecuteFeatureCommand)
export class ExecuteFeatureHandler
  implements ICommandHandler<ExecuteFeatureCommand> {

  constructor(
    @Inject(ENTITY_REPOSITORY)
    private readonly repository: EntityRepository,
  ) {}

  async execute(command: ExecuteFeatureCommand): Promise<void> {
    // 1. Create value objects
    const dataVO = new DataValueObject(command.data);

    // 2. Load aggregate
    const entity = await this.repository.findById(id);
    if (!entity) throw new EntityNotFoundException();

    // 3. Execute business logic
    entity.executeFeature(dataVO);

    // 4. Persist
    await this.repository.save(entity);
  }
}

// ============================================
// PRESENTATION LAYER
// ============================================

// presentation/http/entity.controller.ts
@Controller('entity')
export class EntityController {
  constructor(private readonly commandBus: CommandBus) {}

  @ResponseMessage('Feature executed successfully')
  @Post('execute')
  async execute(@Body() dto: ExecuteFeatureDto) {
    await this.commandBus.execute(
      new ExecuteFeatureCommand(dto.data),
    );
  }
}

// ============================================
// MODULE REGISTRATION
// ============================================

// entity.module.ts
@Module({
  controllers: [EntityController],
  imports: [InfrastructureModule, CqrsModule],
  providers: [
    ExecuteFeatureHandler, // <-- Register here
    {
      provide: ENTITY_REPOSITORY,
      useClass: PrismaEntityRepository,
    },
  ],
})
export class EntityModule {}
```

## Best Practices

### 1. Naming Conventions

- **Commands**: `{Action}{Entity}Command` (e.g., `RegisterUserCommand`)
- **Events**: `{Entity}{Action}Event` (e.g., `UserRegisteredEvent`)
- **Handlers**: `{CommandName}Handler`
- **DTOs**: `{CommandName}Dto`
- **Aggregates**: `{EntityName}` (e.g., `AuthUser`)
- **Value Objects**: `{Concept}` (e.g., `Email`, `Password`)

### 2. Business Logic Location

✅ **DO**: Put business logic in aggregates

```typescript
// ✅ Good - in aggregate
user.verifyOtp(code);
```

❌ **DON'T**: Put business logic in handlers

```typescript
// ❌ Bad - in handler
if (user.status === 'ACTIVE') {
  throw new Error('Already active');
}
```

### 3. Transaction Boundaries

- Use Prisma transactions for aggregate + events persistence
- One transaction per command execution
- Events saved in same transaction as aggregate

### 4. Error Handling

- Domain exceptions extend `DomainException`
- Use appropriate HTTP status codes
- Let NestJS exception filters handle formatting

### 5. Validation

- **Value Objects**: Validate in constructor
- **DTOs**: Use `class-validator` decorators
- **Aggregates**: Validate business rules in methods

## Common Scenarios

### Scenario 1: Add New User Action

**Example**: Implement "Change Password" feature

1. **Domain**: Add `changePassword()` to `AuthUser` aggregate
2. **Command**: Create `ChangePasswordCommand` and handler
3. **DTO**: Create `ChangePasswordDto` with validation
4. **Controller**: Add `PATCH /auth/password` endpoint
5. **Module**: Register `ChangePasswordHandler`

### Scenario 2: Trigger Email Notification

**Example**: Send welcome email after verification

1. **Auth Module**: Already emits `UserVerifiedEvent`
2. **Notification Module**:
   - Create `UserVerifiedEvent` (notification context)
   - Create `UserVerifiedEventDto`
   - Create `UserVerifiedEventHandler` (queue email job)
   - Add `@EventPattern('UserVerifiedEvent')` to consumer
   - Register handler

### Scenario 3: Add New Module

1. Create folder structure: `domain/`, `application/`, `infrastructure/`, `presentation/`
2. Define aggregate with business logic
3. Create repository interface and Prisma implementation
4. Add commands and handlers
5. Create controller
6. Register in `app.module.ts`

## Testing Strategy

### Unit Tests

- Test aggregates in isolation
- Mock repositories
- Verify events are emitted

### Integration Tests

- Test handlers with real DB (testcontainers)
- Verify outbox events created
- Test full command flow

### E2E Tests

- Test via HTTP endpoints
- Verify downstream effects (emails queued)

## Troubleshooting

### Events Not Published

✅ Check outbox worker is running (cron job)  
✅ Verify Kafka connection  
✅ Check `IntegrationEventOutbox` table for PENDING events

### Handler Not Triggered

✅ Verify handler registered in module  
✅ Check `@CommandHandler()` or `@EventsHandler()` decorator  
✅ Ensure CommandBus/EventBus imported in module

### Business Logic Not Working

✅ Check if method called on aggregate  
✅ Verify invariants in aggregate  
✅ Review domain events emitted

## Reference Examples

See existing implementations:

- **Full CQRS flow**: `ResendVerificationCodeCommand` + handler
- **Aggregate**: `AuthUser.requestNewVerificationCode()`
- **Cross-module events**: `UserOtpRequestedEvent` (auth → notification)
- **Outbox worker**: `auth-outbox.worker.ts`
- **Event consumer**: `auth-events.controller.ts`
- **Email queue**: `user-otp-requested-event.handler.ts`

## Quick Reference Commands

```bash
# Start dev server
pnpm run dev

# Build
pnpm run build

# Prisma
pnpm prisma studio          # View database
pnpm prisma migrate dev     # Create migration
pnpm prisma generate        # Generate client

# Docker
docker-compose up           # Start all services
docker-compose up -d        # Start in background
docker-compose logs -f      # View logs
```

---

**Remember**: This architecture prioritizes **business logic clarity**, **testability**, and **scalability** through proper separation of concerns and loose coupling via events.
