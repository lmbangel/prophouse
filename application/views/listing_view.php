<?php $listing = json_decode(json_encode($data), false); ?>
<?php #echo json_encode($listing->data);  
?>


<section class="text-gray-600 body-font">
    <div class="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
        <img class="lg:w-2/6 md:w-3/6 w-5/6 mb-10 object-cover object-center rounded" alt="hero" src="https://propertyhouseza.b-cdn.net/s_<?= $listing->data->displayimagefilepath; ?>">
        <div class="text-center lg:w-2/3 w-full">
		<div class="flex flex-col justify-between p-4 leading-normal">
			<h5 class="mb-2 text-2xl font-bold tracking-tight text-sky-800 dark:text-white">R <?php  echo number_format($listing->data->marketing_list_price, 2); ?></h5>
			<h3 class="mb-3 font-bold text-gray-700 dark:text-gray-400"><?php $listing->data->suburb ? $listing->data->suburb : $listing->data->city ?></h3>
			<p class="mb-3 font-normal text-gray-700 dark:text-gray-400"><?=  $listing->data->marketing_listing_heading ?></p>
			<p>
				<?php if (($listing->data->bedrooms > 0) && ($listing->data->bedrooms != null)){  ?>
					<i class="fa fa-bed text-gray-600 mx-1" aria-hidden="true"></i><span class="mx-1 text-gray-600"><?= $listing->data->bedrooms ?></span>
				<?php } ?>
                <?php if (($listing->data->bathrooms > 0) && ($listing->data->bathrooms != null)){  ?>

					<i class="fa fa-bath text-gray-600 mx-1" aria-hidden="true"></i><span class="mx-1 text-gray-600"><?= $listing->data->bathrooms ?> </span>
			<?php } ?>
            <?php if (($listing->data->garages > 0) && ($listing->data->garages != null)){  ?>
					<i class="fa fa-car text-gray-600 mx-1" aria-hidden="true"></i><span class="mx-1 text-gray-600"><?= $listing->data->garages ?></span>
				<?php } ?>
			</p>
		</div>

        </div>
    </div>
</section>

<section id="gallery-grid">
    <div style="max-width: 45%;" class="container mx-auto flex px-5 pb-24">
        <div class="container mx-auto space-y-2 lg:space-y-0 lg:gap-2 lg:grid lg:grid-cols-3">
            <?php $images = array();
            $images =  json_decode($listing->data->listing_photos);
            foreach ($images as $image) {
                echo  '<div class="rounded md:w-15">
                        <img src="' . $image->filepath . '" alt="'.$listing->data->address.'">
                </div>';
                // echo $image->filepath;
            } ?>
        </div>
    </div>

</section>