export interface AuthorProperties {
    id: string;
    name: string;
    bio: string;
    imageUrl: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class Author implements AuthorProperties {
    private constructor(private readonly props: AuthorProperties) {
        if(!props.name.trim()){
            throw new Error ('Author name cannot be empty');
        }
    }

    static restore(props: AuthorProperties): Author {
        return new Author(props);
    }

     get id(): string {
    return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get bio(): string {
        return this.props.bio;
    }

    get imageUrl(): string {
        return this.props.imageUrl;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    deactivate(): void {
        this.props.isActive = false;
        this.props.updatedAt = new Date();
    }

    activate(): void {
        this.props.isActive = true;
        this.props.updatedAt = new Date();
    }
}

