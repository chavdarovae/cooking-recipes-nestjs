import { Types } from 'mongoose';

export abstract class MongoMapper {
    protected static mapId<T extends Record<string, any> & { _id?: any }>(
        doc: T,
    ): Omit<T, '_id'> & { id: string } {
        if (!doc) return doc;
        const { _id, ...rest } = doc;
        return {
            id: _id instanceof Types.ObjectId ? _id.toString() : _id,
            ...rest,
        };
    }

    protected static mapOwner(owner: any): string {
        if (!owner) return '';

        if (typeof owner === 'object' && owner._id) {
            return owner._id instanceof Types.ObjectId
                ? owner._id.toString()
                : owner._id;
        }

        return owner instanceof Types.ObjectId ? owner.toString() : owner;
    }

    protected static mapManyDocs<T extends { _id?: any }>(
        docs: T[],
    ): (Omit<T, '_id'> & { id: string })[] {
        return docs.map((doc: T) => this.mapId(doc));
    }
}
