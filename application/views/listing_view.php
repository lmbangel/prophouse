<?php $listing = json_decode(json_encode($data), false); ?>
<?php #echo json_encode($listing->data->primary_agent->profile_photo);
$agent  =  json_decode(json_encode($listing->data->primary_agent), false);
$agent = str_replace('{', '', $agent);
$agent = str_replace('}', '', $agent);
// echo $agent;
$agent = explode(",", $agent);
$newAgent = array();
foreach ($agent as $item) {
    $arr = explode('":"', $item);
    $arr[0] = str_replace('"', '', $arr[0]);
    $newAgent[$arr[0]] = str_replace('"', '', $arr[1]);
}

// echo json_encode($newAgent);

?>


<section class="text-gray-600 body-font">
    <div class="container mx-auto md:flex px-5 py-24 items-center justify-center ">
        <div class="max-w-sm mx-2 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
           
                <img class="rounded-t-lg" src="https://propertyhouseza.b-cdn.net/s_<?= $listing->data->displayimagefilepath; ?>" alt="" />
            
            <div class="p-5">
                <a href="#">
                    <h5 class="mb-2 text-2xl font-bold tracking-tight text-sky-800 dark:text-white">R <?php echo number_format($listing->data->marketing_list_price, 2); ?></h5>
                </a>
                <h3 class="mb-3 font-bold text-gray-700 dark:text-gray-400"><?php echo $listing->data->suburb ? $listing->data->suburb : $listing->data->city; ?></h3>
                <p class="mb-3 font-normal text-gray-700 dark:text-gray-400"><?= $listing->data->marketing_listing_heading ?></p>
                <p>
                    <?php if (($listing->data->bedrooms > 0) && ($listing->data->bedrooms != null)) {  ?>
                        <i class="fa fa-bed text-gray-600 mx-1" aria-hidden="true"></i><span class="mx-1 text-gray-600"><?= $listing->data->bedrooms ?></span>
                    <?php } ?>
                    <?php if (($listing->data->bathrooms > 0) && ($listing->data->bathrooms != null)) {  ?>

                        <i class="fa fa-bath text-gray-600 mx-1" aria-hidden="true"></i><span class="mx-1 text-gray-600"><?= $listing->data->bathrooms ?> </span>
                    <?php } ?>
                    <?php if (($listing->data->garages > 0) && ($listing->data->garages != null)) {  ?>
                        <i class="fa fa-car text-gray-600 mx-1" aria-hidden="true"></i><span class="mx-1 text-gray-600"><?= $listing->data->garages ?></span>
                    <?php } ?>
                </p>
            </div>
        </div>
        <div class="max-w-sm mx-2 bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700">
            <!-- <a href="#"> -->
                <img class="rounded-t-lg" src="<?php echo str_replace("\\", '', $newAgent['profile_photo']);  ?>" alt="<?php echo str_replace("\\", '', $newAgent['profile_photo']) . ' profile photo';  ?>" />
            <!-- </a> -->
            <div class="p-5">
                <a href="#">
                    <h5 class="mb-2 text-xl font-bold tracking-tight text-sky-800 dark:text-white"><?php echo $newAgent['firstname'] . ' ' . $newAgent['lastname']; ?></h5>
                </a>
                <p class="mb-3  text-gray-600 dark:text-gray-400">
                    <i class="fa fa-mobile mr-1 " aria-hidden="true"></i>
                    <?php echo $newAgent['cellno']; ?>
                </p>
                <p class="mb-3  text-gray-600 dark:text-gray-400">
                    <i class="fa fa-phone mr-1" aria-hidden="true"></i>
                    <?php echo $newAgent['telno']; ?>
                </p>
                <p class="mb-3  text-gray-600 dark:text-gray-400">
                <i class="fa fa-envelope" aria-hidden="true"></i>
                    <?php echo $newAgent['email']; ?>
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
                        <img src="' . $image->filepath . '" alt="' . $listing->data->address . '">
                </div>';
            } ?>
        </div>
    </div>


</section>