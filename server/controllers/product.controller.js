import { Types } from "mongoose";
import { HTTP_STATUS } from "../config/constants.js";
import { methodErrorHandler } from "../middlewares/errors/method.error.js";
import { CategoryCreateValidationSchema, ProductCreateValidationSchema } from "../middlewares/validation/product.validation.js";
import { Category, Product } from '../models/product.model.js';
import { imageCheck } from "../services/imageCheker.js";
import { errorMessage, errorMessageFormat } from "../utils/error.js";
import { cloudinary } from "../config/cloudinary.js";
import { redis } from "../config/redis.config.js";

export const checkId = (id, next) => {
    if (!Types.ObjectId.isValid(id))
        return next(errorMessage.create(HTTP_STATUS.FAIL, 404, null, 'Endpoint not exist'))
};

const updateFeaturedCache = async () => {
    const featured = await Product.find({ isFeatured: true });
    await redis.set("featured_products", JSON.stringify(featured));
}

const products = methodErrorHandler(
    async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [products, total] = await Promise.all([
            Product.find()
                .select('-__v -isFeatured -createdAt -updatedAt')
                .skip(skip)
                .limit(limit)
                .populate('category', 'name description _id')
                .lean(),
            Product.countDocuments()
        ]);

        if (!products || products.length === 0)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 404, null, 'No products found.'));


        res.status(200).json({
            status: HTTP_STATUS.SUCCESS,
            data: products,
        });
    }
);

const product = methodErrorHandler(
    async (req, res, next) => {
        const id = req.params.id;
        checkId(id, next);

        const product = await Product.findOne({ _id: id })
            .select('-_id -isFeatured -createdAt -updatedAt -__v')
            .populate({ path: 'category', select: 'name description _id' })
            .lean();

        if (!product)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 400, null, 'Product not exist.'));

        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: { ...product } })
    }
);

const create = methodErrorHandler(
    async (req, res, next) => {
        const { error, value } = ProductCreateValidationSchema.validate(req.body)
        const err = (message) => next(errorMessage.create(HTTP_STATUS.FAIL, 400, null, message))

        if (error || !req.body)
            return err(errorMessageFormat(error));

        checkId(value.category, 'Category not exist')
        const categoryExists = await Category.findById(value.category);
        if (!categoryExists)
            return err('Category not exist');
        if (await Category.findOne({ name: value.name }))
            return err('Product exist already');

        const cloudinaryResponse = await imageCheck(req.file, err);
        const product = await Product.create({
            ...value,
            category: categoryExists._id,
            image: cloudinaryResponse.secure_url || '',
        });
        res.status(201).json({
            status: HTTP_STATUS.SUCCESS,
            data: { name: product.name, category: product.category, description: product.description, price: product.price, image: product.image },
            message: 'Product added successfully.'
        });
    }
);

const del = methodErrorHandler(
    async (req, res, next) => {
        const id = req.params.id;
        checkId(id, next);

        const product = await Product.findOne({ _id: id }).lean();
        if (!product)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 404, null, 'Product not exist.'));

        if (!product.image) {
            return next(errorMessage.create(HTTP_STATUS.FAIL, 404, null, 'Product not exist.'));
        };

        const publicId = product.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
        await Product.findOneAndDelete({ _id: product._id });
        await updateFeaturedCache()

        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: null, message: 'Product deleted successfully.' })
    }
);

const featured = methodErrorHandler(
    async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let cached = await redis.get('featured_products');
        if (cached) {
            const allProducts = JSON.parse(cached);
            const paginatedProducts = allProducts.slice(skip, skip + limit);
            return res.status(200).json({
                status: HTTP_STATUS.SUCCESS,
                data: { ...paginatedProducts, },
            });
        }

        const [products, total] = await Promise.all([
            Product.find({ isFeatured: true })
                .select('-isFeatured -createdAt -updatedAt -__v')
                .populate({ path: 'category', select: 'name description _id' })
                .lean(),
            Product.countDocuments({ isFeatured: true })
        ]);

        if (!products || products.length === 0)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 404, null, 'No featured products found.'));

        await redis.set('featured_products', JSON.stringify(products), 'EX', 7 * 24 * 60 * 60);

        const paginated = products.slice(skip, skip + limit);
        res.status(200).json({
            status: HTTP_STATUS.SUCCESS,
            data: paginated,
        });
    }
);

const toggleFeatured = methodErrorHandler(
    async (req, res, next) => {
        const id = req.params.id;
        checkId(id, next);

        let product = await Product.findById(id);
        if (!product)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 404, null, 'Product not exist'));

        product.isFeatured = !product.isFeatured;
        await product.save();
        await updateFeaturedCache();
        product = await Product.findById(id)
            .select('-_id -isFeatured -createdAt -updatedAt -__v')
            .populate({ path: 'category', select: 'name description _id' })
            .lean()
        res.status(200).json({
            status: HTTP_STATUS.SUCCESS, data: {
                ...product
            }
        });
    }
);

const categories = methodErrorHandler(
    async (req, res, next) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [categories, total] = await Promise.all([
            Category.find()
                .select('name description _id')
                .skip(skip)
                .limit(limit)
                .lean(),
            Category.countDocuments()
        ]);

        if (!categories || categories.length === 0)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 404, null, 'No categories found.'));


        res.status(200).json({
            status: HTTP_STATUS.SUCCESS,
            data: categories,
        });
    }
);

const category = methodErrorHandler(
    async (req, res, next) => {
        const id = req.params.id;
        checkId(id, next);

        const category = await Category.findById(id)
            .select('name description _id')
            .lean();

        if (!category)
            return next(errorMessage.create(HTTP_STATUS.FAIL, 404, null, 'Category not exist.'));
        res.status(200).json({ status: HTTP_STATUS.SUCCESS, data: { ...category } })
    }
);

const createCategory = methodErrorHandler(
    async (req, res, next) => {
        const { error, value } = CategoryCreateValidationSchema.validate(req.body);
        const err = (message) => next(errorMessage.create(HTTP_STATUS.FAIL, 400, null, message))

        if (error || !req.body)
            return err(errorMessageFormat(error));

        if (await Category.findOne({ name: value.name }))
            return err('Category exist already.');

        const category = await Category.create({ ...req.body })
        res.status(201).json({ status: HTTP_STATUS.SUCCESS, data: { id: category._id, name: category.name, description: category.description } })
    }
)

const Products = {
    products,
    product,
    create,
    del,
    featured,
    toggleFeatured,
    categories,
    category,
    createCategory
};

export default Products;