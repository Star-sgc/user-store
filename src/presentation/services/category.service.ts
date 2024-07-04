import { CategoryModel } from "../../data";
import { CreateCategoryDto, CustomError, PaginationDto, UserEntity } from "../../domain";

export class CategoryService {

    // DI
    constructor() { }

    createCategory = async (createCategoryDto: CreateCategoryDto, user: UserEntity) => {

        const categoryExists = await CategoryModel.findOne({ name: createCategoryDto.name })
        if (categoryExists) throw CustomError.badRequest('Category already exists')

        try {
            const category = new CategoryModel({
                ...createCategoryDto,
                user: user.id
            })
            await category.save()
            return {
                id: category.id,
                name: category.name,
                available: category.available,
            }
        } catch (error) {
            throw CustomError.internalServer(`${error}`)
        }

    }

    getCategories = async (paginationDto: PaginationDto) => {

        const { page, limit } = paginationDto

        try {

            // const categories = await CategoryModel.find()
            //     .skip((page - 1) * limit)
            //     .limit(limit)

            // const total = await CategoryModel.countDocuments()

            // ! Se puede hacer lo mismo con un array de promesas
            const [total, categories] = await Promise.all([
                CategoryModel.countDocuments(),
                CategoryModel.find()
                .skip((page - 1) * limit)
                .limit(limit)
            ])

            return {
                page: page,
                limit: limit,
                total: total,
                next: `api/category?page=${(page + 1)}&limit=${limit}`,
                prev: (page -1 > 0) ? `api/category?page=${(page - 1)}&limit=${limit}` : null,
                categories: categories.map(category => ({
                    id: category.id,
                    name: category.name,
                    available: category.available,
                }))
            }
        } catch (error) {
            throw CustomError.internalServer('Internal server error')
        }
    }

}