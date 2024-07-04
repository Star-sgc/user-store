import { publicDecrypt } from "crypto";

export class CreateCategoryDto {

    private constructor(
        public readonly name: string,
        public readonly available: string
    ) { }

    static create(object: { [key: string]: any }): [string?, CreateCategoryDto?] {

        const { name, available } = object
        let availableBoolean = available

        if (!name) return (['Missing name', undefined])
        if (typeof availableBoolean !== 'boolean') {
            availableBoolean = (availableBoolean === 'true')
        }

        return [undefined, new CreateCategoryDto(name, availableBoolean)]
    }

}