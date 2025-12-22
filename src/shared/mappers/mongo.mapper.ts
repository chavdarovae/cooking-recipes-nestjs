import { Types } from 'mongoose';
import {
    GenericMetaResponseDTO,
    GenericListResponseDTO,
} from '../dtos/global.dto';

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

    protected static mapEntityList<T>(
        entiyList: T[] = [],
        metaData?: GenericMetaResponseDTO,
    ): GenericListResponseDTO<T> {
        return new GenericListResponseDTO<T>(entiyList, metaData);
    }
}
