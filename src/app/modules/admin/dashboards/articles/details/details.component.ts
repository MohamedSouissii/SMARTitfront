import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormArray,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { ArticlesService } from '../articles.service';
import { ArticlesListComponent } from '../list/list.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { PanierService } from 'app/layout/common/panier/panier.service';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';

@Component({
    selector: 'articles-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatButtonModule,
        MatTooltipModule,
        RouterLink,
        MatIconModule,
        FormsModule,
        ReactiveFormsModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        NgClass,
        MatSelectModule,
        MatOptionModule,
        MatDatepickerModule,
        TextFieldModule,
        FuseFindByKeyPipe,
        DatePipe,
    ],
})
export class ArticlesDetailsComponent implements OnInit, OnDestroy {
    article: any;
    articles: any[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    quantity: number = 0;
    equivalentQuantity: number = 0;

    logoPath: any;
    equivalentLogoPath: any;

    equivalentArticle: any = null;

    isTabletOrMobile: boolean;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _articlesListComponent: ArticlesListComponent,
        private _articlesService: ArticlesService,
        private _panierService: PanierService,
        private _fuseMediaWatcherService: FuseMediaWatcherService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._articlesListComponent.matDrawer.open();

        // Get the articles
        this._articlesService.articles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((articles: any[]) => {
                this.articles = articles;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the article
        this._articlesService.article$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((article: any) => {
                // Open the drawer in case it is closed
                this._articlesListComponent.matDrawer.open();

                // Get the article
                this.article = article;
                this.logoPath= "images/fournisseurs/"+article.frn+".png"


                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the equivalent article
        this._articlesService.equivalentArticle$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((article) => {
            this.equivalentArticle = article;
            this.equivalentLogoPath= "images/fournisseurs/"+article.frn+".png"
            this._changeDetectorRef.markForCheck();
            });

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.isTabletOrMobile = false;
                } else {
                    this.isTabletOrMobile = true;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    addToCart(article: any, quantity: number): void {
        if (article && quantity > 0 && quantity <= article.stock) {
            this._panierService.addToCart(article.id, quantity).subscribe(
                () => {
                    console.log('Ajouté au panier avec succès');
                    this.quantity = 0; // Réinitialiser la quantité
                    this.equivalentQuantity = 0; // Réinitialiser la quantité équivalente
                    this._changeDetectorRef.markForCheck();
                },
                (error) => {
                    console.error('Erreur lors de l\'ajout au panier', error);
                    // Afficher un message d'erreur
                }
            );
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._articlesListComponent.matDrawer.close();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    convertStringToDecimal(input: string): string {
        // Replace comma with dot
        const replacedString = input.replace(',', '.');

        // Parse as float and round to 3 decimal places
        const parsedNumber = parseFloat(replacedString);
        const roundedNumber = parsedNumber.toFixed(3);

        return roundedNumber;
    }

    equivalents() {
        if (this.isTabletOrMobile) {
            this.closeDrawer();
        }
        this._articlesListComponent.equivalentsView = true;
        this._articlesService.equivalents(this.article.id).subscribe((equivalentArticles) => {
          // Handle the equivalent articles here, e.g., display them in the UI
          console.log(equivalentArticles);
        });
    }
}
