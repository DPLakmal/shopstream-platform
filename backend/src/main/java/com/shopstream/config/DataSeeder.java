package com.shopstream.config;

import com.shopstream.entity.Category;
import com.shopstream.entity.Product;
import com.shopstream.entity.ProductImage;
import com.shopstream.repository.CategoryRepository;
import com.shopstream.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public DataSeeder(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            log.info("Seeding default categories and products...");
            Category electronics = categoryRepository.save(new Category("Electronics", "electronics", "Gadgets and tech gear", "Cpu"));
            Category audio = categoryRepository.save(new Category("Audio & Sound", "audio-sound", "Headphones, earbuds and speakers", "Headphones"));
            Category wearables = categoryRepository.save(new Category("Wearables & Smartwatches", "wearables", "Smartwatches and health bands", "Watch"));
            Category apparel = categoryRepository.save(new Category("Apparel & Footwear", "apparel-footwear", "Activewear and running shoes", "Shirt"));
            Category home = categoryRepository.save(new Category("Home & Smart Living", "home-smart-living", "Smart home and appliances", "Home"));

            // Seed Audio Product
            Product p1 = new Product();
            p1.setSku("AUD-APM-01");
            p1.setTitle("AeroPulse Max Wireless Noise-Cancelling Headphones");
            p1.setSlug("aeropulse-max-wireless-headphones");
            p1.setDescription("Engineered with hybrid active noise cancellation, 40mm graphene drivers, spatial audio, and an ultra-lightweight titanium headband.");
            p1.setCategory(audio);
            p1.setBrand("SoundFlow");
            p1.setBasePrice(new BigDecimal("199.99"));
            p1.setSalePrice(new BigDecimal("169.99"));
            p1.setStockQuantity(45);
            p1.setRating(new BigDecimal("4.85"));
            p1.setReviewCount(230);
            p1.setIsActive(true);
            p1.setIsFeatured(true);
            p1.setTags("wireless,headphones,noise-cancelling,bluetooth,over-ear,black");
            p1.setAttributes("{\"color\": \"Midnight Black\", \"battery_life\": \"45h\"}");
            p1.getImages().add(new ProductImage(p1, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80", "Headphones", true, 1));
            productRepository.save(p1);

            // Seed Electronics Product
            Product p2 = new Product();
            p2.setSku("ELE-MBX-04");
            p2.setTitle("ApexBook Pro 16 Ultra Laptop");
            p2.setSlug("apexbook-pro-16-ultra-laptop");
            p2.setDescription("Powered by a 12-core silicon processor, 32GB unified memory, 1TB NVMe Gen4 SSD, and a 120Hz Liquid Retina display.");
            p2.setCategory(electronics);
            p2.setBrand("ApexTech");
            p2.setBasePrice(new BigDecimal("1899.99"));
            p2.setSalePrice(new BigDecimal("1749.99"));
            p2.setStockQuantity(25);
            p2.setRating(new BigDecimal("4.92"));
            p2.setReviewCount(78);
            p2.setIsActive(true);
            p2.setIsFeatured(true);
            p2.setTags("laptop,computer,pro,16-inch");
            p2.setAttributes("{\"ram\": \"32GB\", \"storage\": \"1TB\"}");
            p2.getImages().add(new ProductImage(p2, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80", "Laptop", true, 1));
            productRepository.save(p2);

            // Seed Footwear Product
            Product p3 = new Product();
            p3.setSku("APP-TRX-09");
            p3.setTitle("TerraStride Waterproof Trail Running Shoes");
            p3.setSlug("terrastride-waterproof-trail-running-shoes");
            p3.setDescription("Gore-Tex waterproof membrane paired with Vibram Megagrip lugged outsoles and responsive nitrogen-infused foam midsole.");
            p3.setCategory(apparel);
            p3.setBrand("TerraGear");
            p3.setBasePrice(new BigDecimal("149.99"));
            p3.setSalePrice(new BigDecimal("119.99"));
            p3.setStockQuantity(70);
            p3.setRating(new BigDecimal("4.82"));
            p3.setReviewCount(180);
            p3.setIsActive(true);
            p3.setIsFeatured(true);
            p3.setTags("shoes,running,trail,waterproof,blue");
            p3.setAttributes("{\"material\": \"Gore-Tex\", \"color\": \"Navy Blue\"}");
            p3.getImages().add(new ProductImage(p3, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", "Shoes", true, 1));
            productRepository.save(p3);

            log.info("DataSeeder completed successfully. Seeded {} products.", productRepository.count());
        }
    }
}
