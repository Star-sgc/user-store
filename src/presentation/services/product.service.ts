import { ProductModel } from "../../data";
import { CreateProductDto, CustomError, PaginationDto } from "../../domain";

export class ProductService {

    // DI
    constructor() { }

    createProduct = async (createProductDto: CreateProductDto) => {

        const productExists = await ProductModel.findOne({ name: createProductDto.name })
        if (productExists) throw CustomError.badRequest('Product already exists')

        try {
            const product = new ProductModel( createProductDto )
            console.log(createProductDto)
            await product.save()
            return product
        } catch (error) {
            throw CustomError.internalServer(`${error}`)
        }
    }

    getProducts = async (paginationDto: PaginationDto) => {

        const { page, limit } = paginationDto

        try {

            // const categories = await CategoryModel.find()
            //     .skip((page - 1) * limit)
            //     .limit(limit)

            // const total = await CategoryModel.countDocuments()

            // ! Se puede hacer lo mismo con un array de promesas
            const [total, products] = await Promise.all([
                ProductModel.countDocuments(),
                ProductModel.find()
                    .skip((page - 1) * limit)
                    .limit(limit)
                // todo: populate
                .populate('user')
                .populate('category')
            ])

            return {
                page: page,
                limit: limit,
                total: total,
                next: `api/products?page=${(page + 1)}&limit=${limit}`,
                prev: (page - 1 > 0) ? `api/products?page=${(page - 1)}&limit=${limit}` : null,
                products: products
            }
        } catch (error) {
            throw CustomError.internalServer('Internal server error')
        }
    }

}